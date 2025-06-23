import os
import json
from datetime import datetime, timedelta
import asyncio
from supabase import create_client, Client
import pandas as pd
import numpy as np

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv('SUPABASE_URL', ''),
    os.getenv('SUPABASE_KEY', '')
)

class AnalyticsService:
    async def calculate_success_metrics(self):
        """Calculate success metrics for grants."""
        try:
            # Get all grants
            response = await supabase.table('grants').select('*').execute()
            grants = response.data

            if not grants:
                return

            df = pd.DataFrame(grants)
            
            # Calculate basic metrics
            total_grants = len(df)
            total_amount = df['amount_string'].apply(lambda x: float(x.replace('$', '').replace(',', '')) if x else 0).sum()
            
            # Success rate by status
            status_counts = df['status'].value_counts()
            success_rate = (status_counts.get('approved', 0) / total_grants) * 100 if total_grants > 0 else 0
            
            # Average processing time
            df['created_at'] = pd.to_datetime(df['created_at'])
            df['updated_at'] = pd.to_datetime(df['updated_at'])
            avg_processing_time = (df['updated_at'] - df['created_at']).mean().days

            # Success rate by funder
            funder_stats = df.groupby('funder').agg({
                'id': 'count',
                'status': lambda x: (x == 'approved').sum() / len(x) * 100
            }).reset_index()
            funder_stats.columns = ['funder', 'total_grants', 'success_rate']
            
            # Monthly trends
            monthly_stats = df.set_index('created_at').resample('M').agg({
                'id': 'count',
                'amount_string': lambda x: sum(float(val.replace('$', '').replace(',', '')) if val else 0 for val in x)
            }).reset_index()
            monthly_stats.columns = ['month', 'grants_count', 'total_amount']

            # Store metrics in analytics_cache
            metrics = {
                'total_grants': total_grants,
                'total_amount': total_amount,
                'success_rate': success_rate,
                'avg_processing_time': avg_processing_time,
                'funder_stats': funder_stats.to_dict('records'),
                'monthly_trends': monthly_stats.to_dict('records')
            }

            # Calculate validity period (24 hours)
            valid_until = (datetime.utcnow() + timedelta(hours=24)).isoformat()

            # Update or insert metrics
            await supabase.table('analytics_cache').upsert({
                'metric_name': 'grant_success_metrics',
                'metric_value': metrics,
                'calculation_date': datetime.utcnow().isoformat(),
                'valid_until': valid_until
            }).execute()

        except Exception as e:
            print(f"Error calculating success metrics: {str(e)}")

    async def calculate_activity_metrics(self):
        """Calculate activity metrics from the activity log."""
        try:
            # Get activity logs for the past 30 days
            thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
            response = await supabase.table('activity_log') \
                .select('*') \
                .gte('created_at', thirty_days_ago) \
                .execute()

            activities = response.data

            if not activities:
                return

            df = pd.DataFrame(activities)
            df['created_at'] = pd.to_datetime(df['created_at'])

            # Activity by type
            activity_counts = df['action_type'].value_counts().to_dict()

            # Daily activity trends
            daily_activity = df.groupby(df['created_at'].dt.date)['id'].count()
            
            # User activity
            user_activity = df['user_id'].value_counts().head(10).to_dict()

            # Most active grants
            grant_activity = df['grant_id'].value_counts().head(10).to_dict()

            metrics = {
                'activity_counts': activity_counts,
                'daily_activity': daily_activity.to_dict(),
                'user_activity': user_activity,
                'grant_activity': grant_activity
            }

            valid_until = (datetime.utcnow() + timedelta(hours=24)).isoformat()

            await supabase.table('analytics_cache').upsert({
                'metric_name': 'activity_metrics',
                'metric_value': metrics,
                'calculation_date': datetime.utcnow().isoformat(),
                'valid_until': valid_until
            }).execute()

        except Exception as e:
            print(f"Error calculating activity metrics: {str(e)}")

    async def calculate_task_metrics(self):
        """Calculate task-related metrics."""
        try:
            # Get all tasks
            response = await supabase.table('tasks').select('*').execute()
            tasks = response.data

            if not tasks:
                return

            df = pd.DataFrame(tasks)
            df['created_at'] = pd.to_datetime(df['created_at'])
            df['due_date'] = pd.to_datetime(df['due_date'])

            # Task completion rate
            total_tasks = len(df)
            completed_tasks = len(df[df['status'] == 'completed'])
            completion_rate = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0

            # Tasks by status
            status_distribution = df['status'].value_counts().to_dict()

            # Tasks by priority
            priority_distribution = df['priority'].value_counts().to_dict()

            # Average completion time for completed tasks
            completed_df = df[df['status'] == 'completed']
            avg_completion_time = (completed_df['updated_at'] - completed_df['created_at']).mean().days \
                if not completed_df.empty else 0

            # Overdue tasks
            now = pd.Timestamp.now()
            overdue_tasks = len(df[(df['due_date'] < now) & (df['status'] != 'completed')])

            metrics = {
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'completion_rate': completion_rate,
                'status_distribution': status_distribution,
                'priority_distribution': priority_distribution,
                'avg_completion_time': avg_completion_time,
                'overdue_tasks': overdue_tasks
            }

            valid_until = (datetime.utcnow() + timedelta(hours=24)).isoformat()

            await supabase.table('analytics_cache').upsert({
                'metric_name': 'task_metrics',
                'metric_value': metrics,
                'calculation_date': datetime.utcnow().isoformat(),
                'valid_until': valid_until
            }).execute()

        except Exception as e:
            print(f"Error calculating task metrics: {str(e)}")

    async def calculate_document_metrics(self):
        """Calculate document-related metrics."""
        try:
            # Get all documents
            response = await supabase.table('documents').select('*').execute()
            documents = response.data

            if not documents:
                return

            df = pd.DataFrame(documents)
            df['created_at'] = pd.to_datetime(df['created_at'])

            # Total documents and templates
            total_documents = len(df)
            total_templates = len(df[df['is_template'] == True])

            # Documents by type
            type_distribution = df['file_type'].value_counts().to_dict()

            # Average document size
            avg_size = df['size_bytes'].mean()

            # Documents per grant
            docs_per_grant = df.groupby('grant_id')['id'].count().describe().to_dict()

            # Monthly document uploads
            monthly_uploads = df.set_index('created_at') \
                .resample('M')['id'].count() \
                .tail(12) \
                .to_dict()

            metrics = {
                'total_documents': total_documents,
                'total_templates': total_templates,
                'type_distribution': type_distribution,
                'avg_size_bytes': avg_size,
                'docs_per_grant_stats': docs_per_grant,
                'monthly_uploads': monthly_uploads
            }

            valid_until = (datetime.utcnow() + timedelta(hours=24)).isoformat()

            await supabase.table('analytics_cache').upsert({
                'metric_name': 'document_metrics',
                'metric_value': metrics,
                'calculation_date': datetime.utcnow().isoformat(),
                'valid_until': valid_until
            }).execute()

        except Exception as e:
            print(f"Error calculating document metrics: {str(e)}")

async def main():
    """Main function to run the analytics service."""
    analytics_service = AnalyticsService()
    
    while True:
        try:
            # Calculate all metrics
            await analytics_service.calculate_success_metrics()
            await analytics_service.calculate_activity_metrics()
            await analytics_service.calculate_task_metrics()
            await analytics_service.calculate_document_metrics()
            
            # Wait for 1 hour before next calculation
            await asyncio.sleep(3600)
        except Exception as e:
            print(f"Error in main loop: {str(e)}")
            await asyncio.sleep(300)  # Wait for 5 minutes before retrying

if __name__ == "__main__":
    asyncio.run(main()) 