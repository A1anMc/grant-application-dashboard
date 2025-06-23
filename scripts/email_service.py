import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import asyncio
from supabase import create_client, Client

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv('SUPABASE_URL', ''),
    os.getenv('SUPABASE_KEY', '')
)

# Email configuration
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USERNAME = os.getenv('SMTP_USERNAME', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
FROM_EMAIL = os.getenv('FROM_EMAIL', SMTP_USERNAME)

class EmailService:
    def __init__(self):
        self.smtp_server = SMTP_SERVER
        self.smtp_port = SMTP_PORT
        self.username = SMTP_USERNAME
        self.password = SMTP_PASSWORD
        self.from_email = FROM_EMAIL

    def send_email(self, to_email: str, subject: str, html_content: str):
        """Send an email using SMTP."""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email

            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)

            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)

            return True
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False

class NotificationService:
    def __init__(self):
        self.email_service = EmailService()

    async def process_notifications(self):
        """Process pending notifications."""
        try:
            # Get pending notifications
            response = await supabase.table('email_notifications') \
                .select('*') \
                .eq('status', 'pending') \
                .lte('scheduled_for', datetime.utcnow().isoformat()) \
                .execute()

            notifications = response.data

            for notification in notifications:
                success = await self.send_notification(notification)
                
                # Update notification status
                status = 'sent' if success else 'failed'
                await supabase.table('email_notifications') \
                    .update({'status': status, 'sent_at': datetime.utcnow().isoformat()}) \
                    .eq('id', notification['id']) \
                    .execute()

        except Exception as e:
            print(f"Error processing notifications: {str(e)}")

    async def send_notification(self, notification):
        """Send a single notification."""
        try:
            # Get grant details
            grant_response = await supabase.table('grants') \
                .select('*') \
                .eq('id', notification['grant_id']) \
                .single() \
                .execute()

            grant = grant_response.data

            # Generate email content based on notification type
            subject, content = self.generate_email_content(notification['notification_type'], grant, notification['template_data'])

            # Send email
            success = self.email_service.send_email(
                notification['recipient_email'],
                subject,
                content
            )

            return success
        except Exception as e:
            print(f"Error sending notification: {str(e)}")
            return False

    def generate_email_content(self, notification_type: str, grant: dict, template_data: dict):
        """Generate email content based on notification type."""
        if notification_type == 'deadline_reminder':
            days_until = template_data.get('days_until', 0)
            subject = f"Deadline Reminder: {grant['name']} due in {days_until} days"
            content = f"""
            <html>
                <body>
                    <h2>Grant Deadline Reminder</h2>
                    <p>The grant application for <strong>{grant['name']}</strong> is due in {days_until} days.</p>
                    <p><strong>Details:</strong></p>
                    <ul>
                        <li>Funder: {grant['funder']}</li>
                        <li>Due Date: {grant['due_date']}</li>
                        <li>Amount: {grant['amount_string']}</li>
                    </ul>
                    <p>Please ensure all required documents are prepared and submitted before the deadline.</p>
                </body>
            </html>
            """
        elif notification_type == 'status_update':
            subject = f"Status Update: {grant['name']}"
            content = f"""
            <html>
                <body>
                    <h2>Grant Status Update</h2>
                    <p>The status of <strong>{grant['name']}</strong> has been updated to <strong>{grant['status']}</strong>.</p>
                    <p><strong>Details:</strong></p>
                    <ul>
                        <li>Funder: {grant['funder']}</li>
                        <li>Updated At: {grant['updated_at']}</li>
                    </ul>
                </body>
            </html>
            """
        else:
            subject = f"Grant Notification: {grant['name']}"
            content = f"""
            <html>
                <body>
                    <h2>Grant Notification</h2>
                    <p>This is a notification regarding the grant <strong>{grant['name']}</strong>.</p>
                    <p>Please check the grant management system for more details.</p>
                </body>
            </html>
            """

        return subject, content

async def schedule_deadline_reminders():
    """Schedule deadline reminders for upcoming grants."""
    try:
        # Get grants with upcoming deadlines
        response = await supabase.table('grants') \
            .select('*') \
            .not_('due_date', 'is', null) \
            .execute()

        grants = response.data
        now = datetime.utcnow()

        for grant in grants:
            due_date = datetime.fromisoformat(grant['due_date'].replace('Z', '+00:00'))
            days_until = (due_date - now).days

            # Schedule reminders at 30, 14, 7, 3, and 1 days before deadline
            reminder_days = [30, 14, 7, 3, 1]
            
            for days in reminder_days:
                if days == days_until:
                    # Get team members
                    team_members = grant.get('team_members', [])
                    
                    # Schedule notification for each team member
                    for email in team_members:
                        await supabase.table('email_notifications').insert({
                            'grant_id': grant['id'],
                            'recipient_email': email,
                            'notification_type': 'deadline_reminder',
                            'scheduled_for': now.isoformat(),
                            'template_data': {
                                'days_until': days
                            }
                        }).execute()

    except Exception as e:
        print(f"Error scheduling deadline reminders: {str(e)}")

async def main():
    """Main function to run the notification service."""
    notification_service = NotificationService()
    
    while True:
        try:
            # Process notifications
            await notification_service.process_notifications()
            
            # Schedule new deadline reminders
            await schedule_deadline_reminders()
            
            # Wait for 5 minutes before next check
            await asyncio.sleep(300)
        except Exception as e:
            print(f"Error in main loop: {str(e)}")
            await asyncio.sleep(60)  # Wait for 1 minute before retrying

if __name__ == "__main__":
    asyncio.run(main()) 