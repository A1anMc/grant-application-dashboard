#!/usr/bin/env python3
"""
PDF Processing Microservice for Grant IQ Pro Edition
Handles PDF text extraction and grant analysis
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pdfplumber
import tempfile
import os
import re
from datetime import datetime

app = FastAPI(
    title="Grant IQ Pro - PDF Processor",
    description="PDF processing microservice for grant document analysis",
    version="1.0.0"
)

# CORS middleware to allow requests from Grant IQ Pro frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PDFAnalysisRequest(BaseModel):
    deadline: Optional[str] = None
    project_type: Optional[str] = "general"

class TaskExtraction(BaseModel):
    task: str
    category: str
    section: str
    priority: str
    estimated_hours: int
    description: str

class PDFAnalysisResponse(BaseModel):
    text_content: str
    tasks: List[TaskExtraction]
    sections: List[str]
    key_dates: List[str]
    requirements: List[str]
    word_count: int
    analysis_summary: str

class GrantEligibilityAnalysis(BaseModel):
    is_eligible: bool
    confidence_score: float
    eligibility_factors: List[str]
    missing_requirements: List[str]
    recommendations: List[str]

class PDFProcessor:
    """Enhanced PDF processor for Grant IQ Pro integration"""
    
    def __init__(self):
        self.grant_keywords = {
            'eligibility': ['eligible', 'qualification', 'criteria', 'requirement', 'must', 'should'],
            'deadlines': ['deadline', 'due date', 'submission', 'close', 'applications close'],
            'funding': ['amount', 'funding', 'grant', '$', 'budget', 'costs'],
            'application': ['application', 'form', 'submit', 'upload', 'attach'],
            'team': ['team', 'personnel', 'staff', 'crew', 'producer', 'director'],
            'business': ['ABN', 'company', 'business', 'entity', 'legal', 'structure'],
            'diversity': ['diversity', 'inclusion', 'first nations', 'indigenous', 'cultural']
        }
        
        self.categories = {
            'Business': ['finance', 'budget', 'eligibility', 'rights', 'funding'],
            'Team': ['team', 'bios', 'crew', 'cast', 'producer', 'director'],
            'Company': ['ABN', 'contact', 'legal', 'company', 'entity'],
            'Submission': ['upload', 'deadline', 'forms', 'submit', 'application']
        }

    async def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            with pdfplumber.open(file_path) as pdf:
                text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                return text
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

    def analyze_grant_eligibility(self, text: str) -> GrantEligibilityAnalysis:
        """Analyze grant eligibility based on PDF content"""
        text_lower = text.lower()
        
        eligibility_factors = []
        missing_requirements = []
        confidence_score = 0.0
        
        # Check for common eligibility indicators
        if any(keyword in text_lower for keyword in ['australian', 'australia']):
            eligibility_factors.append("Australian entity requirement likely met")
            confidence_score += 0.2
            
        if any(keyword in text_lower for keyword in ['abn', 'business number']):
            eligibility_factors.append("Business registration requirements mentioned")
            confidence_score += 0.15
            
        if any(keyword in text_lower for keyword in ['first nations', 'indigenous']):
            eligibility_factors.append("First Nations content/involvement mentioned")
            confidence_score += 0.25
            
        if any(keyword in text_lower for keyword in ['documentary', 'film', 'screen']):
            eligibility_factors.append("Screen/documentary content aligned")
            confidence_score += 0.2
            
        # Check for potential missing requirements
        if 'budget' not in text_lower:
            missing_requirements.append("Budget information may be required")
            
        if not any(keyword in text_lower for keyword in ['team', 'crew', 'producer']):
            missing_requirements.append("Team/crew information may be required")
        
        recommendations = [
            "Review complete eligibility criteria",
            "Ensure all required documents are prepared",
            "Check deadline and submission requirements"
        ]
        
        is_eligible = confidence_score > 0.3
        
        return GrantEligibilityAnalysis(
            is_eligible=is_eligible,
            confidence_score=min(confidence_score, 1.0),
            eligibility_factors=eligibility_factors,
            missing_requirements=missing_requirements,
            recommendations=recommendations
        )

    def extract_tasks_from_text(self, text: str) -> List[TaskExtraction]:
        """Extract actionable tasks from PDF text"""
        tasks = []
        lines = text.split('\n')
        current_section = "General"
        
        for line in lines:
            line = line.strip()
            if not line or len(line) < 10:
                continue
                
            if self._is_section_header(line):
                current_section = line
                continue
                
            if self._is_task_line(line):
                task = self._create_task_from_line(line, current_section)
                if task:
                    tasks.append(task)
        
        return tasks

    def _is_section_header(self, line: str) -> bool:
        """Check if line is a section header"""
        patterns = [
            r'^[A-Z][A-Z\s&]+(?:SECTION|FORM|REQUIREMENTS)',
            r'^\d+\.\s*[A-Z][A-Za-z\s]+',
            r'^[A-Z][A-Za-z\s]+:$'
        ]
        return any(re.match(pattern, line) for pattern in patterns)

    def _is_task_line(self, line: str) -> bool:
        """Check if line represents a task or requirement"""
        task_indicators = [
            line.endswith('?'),
            line.endswith(':'),
            'provide' in line.lower(),
            'submit' in line.lower(),
            'complete' in line.lower()
        ]
        return any(task_indicators)

    def _create_task_from_line(self, line: str, section: str) -> Optional[TaskExtraction]:
        """Create a task extraction from a line of text"""
        category = self._categorize_line(line)
        priority = self._determine_priority(line, category)
        estimated_hours = self._estimate_hours(category)
        
        # Clean up the task text
        task_text = line.strip()
        if task_text.endswith(':'):
            task_text = task_text[:-1]
            
        return TaskExtraction(
            task=task_text,
            category=category,
            section=section,
            priority=priority,
            estimated_hours=estimated_hours,
            description=f"Task extracted from section: {section}"
        )

    def _categorize_line(self, line: str) -> str:
        """Categorize a line based on keywords"""
        line_lower = line.lower()
        
        for category, keywords in self.categories.items():
            if any(keyword in line_lower for keyword in keywords):
                return category
                
        return "General"

    def _determine_priority(self, line: str, category: str) -> str:
        """Determine task priority based on content and category"""
        line_lower = line.lower()
        
        if any(word in line_lower for word in ['must', 'required', 'mandatory']):
            return "High"
        elif category in ['Business', 'Submission']:
            return "High"
        else:
            return "Medium"

    def _estimate_hours(self, category: str) -> int:
        """Estimate hours required for a task"""
        hours = {'Business': 4, 'Team': 2, 'Company': 1, 'Submission': 3}
        return hours.get(category, 2)

    def extract_key_information(self, text: str) -> Dict[str, List[str]]:
        """Extract key information categories from text"""
        info = {
            'sections': [],
            'key_dates': [],
            'requirements': []
        }
        
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            
            if self._is_section_header(line):
                info['sections'].append(line)
                
            if self._contains_date(line):
                info['key_dates'].append(line)
                
            if self._is_requirement(line):
                info['requirements'].append(line)
        
        return info

    def _contains_date(self, line: str) -> bool:
        """Check if line contains a date"""
        date_patterns = [
            r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',
            r'\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{2,4}',
            r'deadline|due date|close'
        ]
        return any(re.search(pattern, line, re.IGNORECASE) for pattern in date_patterns)

    def _is_requirement(self, line: str) -> bool:
        """Check if line describes a requirement"""
        requirement_keywords = ['must', 'required', 'mandatory', 'need to', 'should']
        return any(keyword in line.lower() for keyword in requirement_keywords)

# Initialize the processor
pdf_processor = PDFProcessor()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Grant IQ Pro PDF Processor is running", "version": "1.0.0"}

@app.post("/analyze-pdf", response_model=PDFAnalysisResponse)
async def analyze_pdf(
    file: UploadFile = File(...),
    analysis_request: PDFAnalysisRequest = None
):
    """Analyze a PDF file and extract grant-related information"""
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_file_path = temp_file.name
    
    try:
        # Extract text from PDF
        text_content = await pdf_processor.extract_text_from_pdf(temp_file_path)
        
        # Extract tasks
        tasks = pdf_processor.extract_tasks_from_text(text_content)
        
        # Extract key information
        key_info = pdf_processor.extract_key_information(text_content)
        
        # Generate analysis summary
        word_count = len(text_content.split())
        analysis_summary = f"Extracted {len(tasks)} tasks from {len(key_info['sections'])} sections"
        
        return PDFAnalysisResponse(
            text_content=text_content[:500] + "..." if len(text_content) > 500 else text_content,
            tasks=tasks,
            sections=key_info['sections'],
            key_dates=key_info['key_dates'],
            requirements=key_info['requirements'],
            word_count=word_count,
            analysis_summary=analysis_summary
        )
        
    finally:
        # Clean up temporary file
        os.unlink(temp_file_path)

@app.post("/eligibility-analysis", response_model=GrantEligibilityAnalysis)
async def analyze_eligibility(file: UploadFile = File(...)):
    """Analyze PDF for grant eligibility"""
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_file_path = temp_file.name
    
    try:
        # Extract text and analyze eligibility
        text_content = await pdf_processor.extract_text_from_pdf(temp_file_path)
        eligibility_analysis = pdf_processor.analyze_grant_eligibility(text_content)
        
        return eligibility_analysis
        
    finally:
        # Clean up temporary file
        os.unlink(temp_file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 