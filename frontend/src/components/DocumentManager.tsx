import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export interface Document {
  id: string
  name: string
  file_path: string
  file_type: string
  size_bytes: number
  version: number
  created_at: string
  updated_at: string
  created_by: string
  is_template: boolean
}

interface DocumentManagerProps {
  grantId: number
}

export default function DocumentManager({ grantId }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTemplate, setIsTemplate] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  useEffect(() => {
    fetchDocuments()
  }, [grantId])

  async function fetchDocuments() {
    setError(null)
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('grant_id', grantId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setDocuments(data || [])
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while fetching documents')
    } finally {
      setLoading(false)
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      // Reset states
      setSelectedFile(file)
      setError(null)
      setUploadProgress(0)
    }
  }

  async function handleUpload() {
    if (!selectedFile) return

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const filePath = `${grantId}/${Date.now()}-${selectedFile.name}`
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      setUploadProgress(50) // Set progress to 50% after storage upload

      // Create database record
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          grant_id: grantId,
          name: selectedFile.name,
          file_path: filePath,
          file_type: selectedFile.type,
          size_bytes: selectedFile.size,
          version: 1,
          is_template: isTemplate,
          created_by: 'test-user-id'
        })

      if (insertError) {
        // Clean up storage file if database insert fails
        await supabase.storage
          .from('documents')
          .remove([filePath])
        throw insertError
      }

      setUploadProgress(100) // Set progress to 100% after database insert
      await fetchDocuments() // Refresh document list
    } catch (err) {
      console.error('Error uploading document:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while uploading the document')
    } finally {
      setUploading(false)
      setSelectedFile(null)
      setUploadProgress(0)
    }
  }

  async function handleDownload(doc: Document) {
    setError(null)
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path)

      if (error) throw error

      const blob = new Blob([data], { type: doc.file_type })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = doc.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading document:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while downloading the document')
    }
  }

  async function handleDelete(doc: Document) {
    setError(null)
    try {
      // Delete file from storage
      const { error: removeError } = await supabase.storage
        .from('documents')
        .remove([doc.file_path])

      if (removeError) throw removeError

      // Delete database record
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id)

      if (deleteError) throw deleteError

      // Update local state
      setDocuments(prevDocs => prevDocs.filter(d => d.id !== doc.id))
    } catch (err) {
      console.error('Error deleting document:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the document')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div role="status" aria-label="Loading documents">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          <span className="sr-only">Loading documents</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Documents</h2>
        <div className="flex items-center space-x-4">
          <label className="relative cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            <span>Upload Document</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              aria-label="Choose a file to upload"
            />
          </label>
          {selectedFile && (
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={isTemplate}
                  onChange={(e) => setIsTemplate(e.target.checked)}
                  aria-label="Mark as template document"
                />
                Mark as template
              </label>
              <button
                className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white"
                onClick={handleUpload}
                disabled={uploading}
                aria-label={`Upload ${selectedFile?.name || 'selected file'}`}
              >
                Start Upload
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {documents.length > 0 ? (
        <ul className="space-y-4" role="list">
          {documents.map((doc) => (
            <li key={doc.id} className="flex justify-between items-center p-4 bg-white shadow rounded-lg">
              <div>
                <h3 className="font-medium">{doc.name}</h3>
                <p className="text-sm text-gray-500">{doc.file_type} • {formatFileSize(doc.size_bytes)}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded"
                  onClick={() => handleDownload(doc)}
                  role="button"
                  aria-label={`Download ${doc.name}`}
                >
                  Download
                </button>
                <button
                  className="text-red-600 hover:text-red-800 px-3 py-1 rounded"
                  onClick={() => handleDelete(doc)}
                  role="button"
                  aria-label={`Delete ${doc.name}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-center py-4" aria-label="No documents available">No documents uploaded yet.</p>
      )}
    </div>
  )
} 