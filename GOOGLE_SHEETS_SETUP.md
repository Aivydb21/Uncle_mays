# 🔧 Google Sheets Setup Guide for Uncle May's Forms

## ❌ **Current Issue:**
Your forms aren't working because the Google Sheets authentication isn't configured. The forms need proper Google API credentials to write to your spreadsheet.

## ✅ **What You Need:**

### 1. **Google Cloud Project Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Sheets API**
4. Go to **APIs & Services** → **Credentials**

### 2. **Create Service Account**
1. Click **"Create Credentials"** → **"Service Account"**
2. Give it a name: `uncle-mays-sheets`
3. Click **"Create and Continue"**
4. Skip role assignment (click **"Continue"**)
5. Click **"Done"**

### 3. **Generate JSON Key**
1. Click on your new service account
2. Go to **"Keys"** tab
3. Click **"Add Key"** → **"Create New Key"**
4. Choose **JSON** format
5. Download the JSON file

### 4. **Share Your Google Sheet**
1. Open your [Google Sheet](https://docs.google.com/spreadsheets/d/1TrlmNvVQycYAf2p8g4tUaKRT3wctq7rUtQHXA16E3aI/edit?usp=sharing)
2. Click **"Share"** button
3. Add your service account email (from the JSON file)
4. Give it **"Editor"** permissions
5. Click **"Send"**

### 5. **Set Environment Variables**
Create a `.env.local` file in your project root with:

```bash
# Google Sheets Configuration (REQUIRED for forms to work)
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----"
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_SPREADSHEET_ID=1TrlmNvVQycYAf2p8g4tUaKRT3wctq7rUtQHXA16E3aI
GOOGLE_SHEETS_SHEET_NAME=Sheet1

# Optional: Mailchimp Configuration
MAILCHIMP_API_KEY=your_mailchimp_api_key
MAILCHIMP_SERVER_PREFIX=your_server_prefix
MAILCHIMP_LIST_ID=your_list_id

# Optional: Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 🔑 **Important Notes:**

### **Private Key Format:**
- Copy the entire private key from your JSON file
- Include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts
- The `\n` characters will be automatically converted to newlines

### **Service Account Email:**
- Found in the `client_email` field of your JSON file
- Looks like: `uncle-mays-sheets@project-id.iam.gserviceaccount.com`

## 🧪 **Testing:**

1. **Start your development server:**
   ```bash
   cd new_project
   npm run dev
   ```

2. **Fill out a form** on your website
3. **Check your Google Sheet** - you should see the new entry
4. **Check the browser console** for any error messages

## 🚀 **For Vercel Deployment:**

When you deploy to Vercel, add these same environment variables in your Vercel dashboard:

1. Go to your project in Vercel
2. Click **"Settings"** → **"Environment Variables"**
3. Add each variable from your `.env.local` file
4. Redeploy your project

## 🆘 **Troubleshooting:**

### **Form Still Not Working?**
- Check browser console for errors
- Verify environment variables are set correctly
- Ensure Google Sheet is shared with service account
- Check that Google Sheets API is enabled

### **Common Errors:**
- `"Google Sheets not configured"` → Environment variables missing
- `"Permission denied"` → Sheet not shared with service account
- `"API not enabled"` → Google Sheets API not enabled in Cloud Console

## 📊 **Expected Result:**

Once configured, your forms will:
1. ✅ **Save to Google Sheets** automatically
2. ✅ **Prevent duplicates** (update existing emails)
3. ✅ **Include all form data** (email, zip, interests, source, timestamp)
4. ✅ **Work in production** on Vercel

Your Google Sheet will receive entries like:
| Email | Zip Code | Interests | Source | Timestamp | Status |
|-------|----------|-----------|---------|-----------|---------|
| test@example.com | 60615 | popups, delivery | hero | 2025-08-26T... | Active |

## 🎯 **Next Steps:**

1. **Follow the setup guide above**
2. **Test locally** with `npm run dev`
3. **Verify forms work** and save to Google Sheets
4. **Deploy to Vercel** with environment variables
5. **Test in production**

Let me know if you need help with any of these steps! 🚀
