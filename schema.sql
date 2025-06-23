-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Existing grants table with new columns
CREATE TABLE IF NOT EXISTS grants (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    funder TEXT NOT NULL,
    description TEXT,
    amount_string TEXT,
    due_date DATE,
    status TEXT DEFAULT 'potential' CHECK (status IN ('potential', 'drafting', 'submitted', 'successful', 'unsuccessful', 'archived')),
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization Profiles table
CREATE TABLE IF NOT EXISTS organization_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL,
    abn TEXT NOT NULL,
    website TEXT,
    dgr_status BOOLEAN DEFAULT FALSE,
    charity_status BOOLEAN DEFAULT FALSE,
    organization_type TEXT,
    primary_focus_areas TEXT, -- JSON string of focus areas array
    organization_history TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- AI Responses table for storing grant writer responses
CREATE TABLE IF NOT EXISTS ai_responses (
    id BIGSERIAL PRIMARY KEY,
    grant_id BIGINT REFERENCES grants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table for file attachments
CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    grant_id BIGINT REFERENCES grants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    file_type TEXT,
    is_template BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table for grant discussions
CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    grant_id BIGINT REFERENCES grants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table for grant-related tasks
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    grant_id BIGINT REFERENCES grants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    grant_id INTEGER REFERENCES grants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    action_type VARCHAR(50) NOT NULL,
    action_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analytics table for caching computed metrics
CREATE TABLE IF NOT EXISTS analytics_cache (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value JSONB NOT NULL,
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE,
    UNIQUE (metric_name)
);

-- Email notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
    id SERIAL PRIMARY KEY,
    grant_id INTEGER REFERENCES grants(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    template_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_grants_status ON grants(status);
CREATE INDEX IF NOT EXISTS idx_grants_due_date ON grants(due_date);
CREATE INDEX IF NOT EXISTS idx_grants_created_at ON grants(created_at);
CREATE INDEX IF NOT EXISTS idx_organization_profiles_user_id ON organization_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_grant_id ON ai_responses(grant_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_user_id ON ai_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_grant_id ON tasks(grant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_comments_grant_id ON comments(grant_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_grant_id ON documents(grant_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_grant_id ON activity_log(grant_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_grants_updated_at BEFORE UPDATE ON grants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organization_profiles_updated_at BEFORE UPDATE ON organization_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log activities
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_log (grant_id, user_id, action_type, action_details)
    VALUES (
        NEW.id,
        auth.uid(),
        CASE
            WHEN TG_OP = 'INSERT' THEN 'grant_created'
            WHEN TG_OP = 'UPDATE' THEN 'grant_updated'
            WHEN TG_OP = 'DELETE' THEN 'grant_deleted'
        END,
        jsonb_build_object(
            'old_data', to_jsonb(OLD),
            'new_data', to_jsonb(NEW)
        )
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for activity logging
CREATE TRIGGER log_grant_activity
    AFTER INSERT OR UPDATE OR DELETE ON grants
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- RLS Policies
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Grant access policies
CREATE POLICY "Allow public read access to grants" ON grants FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert grants" ON grants FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update grants" ON grants FOR UPDATE USING (auth.role() = 'authenticated');

-- Organization profiles policies
CREATE POLICY "Users can view own profile" ON organization_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON organization_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON organization_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON organization_profiles FOR DELETE USING (auth.uid() = user_id);

-- AI responses policies
CREATE POLICY "Users can view own AI responses" ON ai_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own AI responses" ON ai_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own AI responses" ON ai_responses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own AI responses" ON ai_responses FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Users can view own comments" ON comments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON documents FOR DELETE USING (auth.uid() = user_id);

-- Activity log policies
CREATE POLICY "Enable read access for all users" ON activity_log FOR SELECT TO authenticated USING (true);

-- Email notification policies
CREATE POLICY "Enable read access for all users" ON email_notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON email_notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON email_notifications FOR UPDATE TO authenticated USING (true);

-- Insert sample data
INSERT INTO grants (name, funder, description, amount_string, due_date, status, source_url) VALUES
('Community Development Grant', 'Australian Government', 'Supporting local community development initiatives and capacity building programs.', '$50,000 - $200,000', '2024-03-15', 'potential', 'https://www.grants.gov.au/'),
('Environmental Sustainability Fund', 'NSW Government', 'Funding for environmental conservation and sustainability projects in NSW.', 'Up to $100,000', '2024-02-28', 'potential', 'https://www.environment.nsw.gov.au/'),
('Arts and Culture Grant', 'Australia Council', 'Supporting innovative arts and cultural projects across Australia.', '$25,000 - $75,000', '2024-04-30', 'potential', 'https://australiacouncil.gov.au/'),
('Youth Services Initiative', 'Department of Social Services', 'Funding for youth support services and programs.', '$30,000 - $150,000', '2024-03-01', 'potential', 'https://www.dss.gov.au/'),
('Innovation Technology Grant', 'Department of Industry', 'Supporting technology innovation and research development.', '$100,000 - $500,000', '2024-05-15', 'potential', 'https://www.industry.gov.au/'),
('Health and Wellbeing Fund', 'Department of Health', 'Funding for community health and wellbeing initiatives.', '$20,000 - $80,000', '2024-02-15', 'potential', 'https://www.health.gov.au/'),
('Education Excellence Grant', 'Department of Education', 'Supporting educational programs and initiatives.', '$40,000 - $120,000', '2024-06-30', 'potential', 'https://www.education.gov.au/'),
('Indigenous Community Support', 'NIAA', 'Funding for Indigenous community development and cultural programs.', '$25,000 - $100,000', '2024-04-15', 'potential', 'https://www.niaa.gov.au/'),
('Disability Services Grant', 'NDIS', 'Supporting disability services and accessibility initiatives.', '$35,000 - $90,000', '2024-03-30', 'potential', 'https://www.ndis.gov.au/'),
('Climate Action Fund', 'Department of Climate Change', 'Funding for climate change mitigation and adaptation projects.', '$50,000 - $250,000', '2024-07-31', 'potential', 'https://www.dcceew.gov.au/'); 