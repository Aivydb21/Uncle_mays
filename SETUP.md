# 🚀 Uncle Mays Produce - Setup Guide

## 📋 Prerequisites

Before running this application, you'll need to set up the following services:

### 1. Airtable Setup
1. **Create an Airtable account** at [airtable.com](https://airtable.com)
2. **Create a new base** called "Uncle Mays Produce"
3. **Create a table** called "Subscriptions" with these fields:
   - `Email` (Single line text)
   - `Zip Code` (Single line text)
   - `Interests` (Long text)
   - `Source` (Single select: hero, cta)
   - `Timestamp` (Date)
   - `Status` (Single select: Active, Inactive)
   - `Last Updated` (Date)
4. **Get your API key**:
   - Go to [airtable.com/account](https://airtable.com/account)
   - Generate a new API key
5. **Get your Base ID**:
   - Open your base
   - Go to Help → API Documentation
   - Copy the Base ID from the URL

### 2. Mailchimp Setup
1. **Create a Mailchimp account** at [mailchimp.com](https://mailchimp.com)
2. **Create an audience/list** for your subscribers
3. **Get your API key**:
   - Go to Account → Extras → API Keys
   - Generate a new API key
4. **Get your Server Prefix**:
   - Look at your API key URL (e.g., `us1` in `https://us1.api.mailchimp.com`)
5. **Get your List ID**:
   - Go to Audience → Settings → Audience name and defaults
   - Copy the Audience ID

### 3. Google Analytics Setup
1. **Create a Google Analytics account** at [analytics.google.com](https://analytics.google.com)
2. **Create a new property** for your website
3. **Get your Measurement ID** (starts with G-)

## 🔧 Environment Configuration

1. **Copy the environment template**:
   ```bash
   cp env.example .env.local
   ```

2. **Fill in your actual values** in `.env.local`:
   ```bash
   # Airtable Configuration
   AIRTABLE_API_KEY=keyYourActualApiKeyHere
   AIRTABLE_BASE_ID=appYourActualBaseIdHere
   AIRTABLE_TABLE_NAME=Subscriptions

   # Mailchimp Configuration
   MAILCHIMP_API_KEY=your_actual_mailchimp_api_key_here
   MAILCHIMP_SERVER_PREFIX=us1
   MAILCHIMP_LIST_ID=your_actual_list_id_here

   # Google Analytics
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

## 🚀 Running the Application

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:3000`

## 📊 Data Flow

### Form Submission Process:
1. **User submits form** → Form data sent to `/api/subscribe`
2. **API validates data** → Checks email and zip code
3. **Airtable integration** → Saves/updates subscriber data
4. **Mailchimp integration** → Adds subscriber to email list
5. **Analytics tracking** → Records form submission events
6. **Success response** → User sees confirmation message

### Data Collected:
- **Email address** (required)
- **Zip code** (required)
- **Interests** (pop-ups, delivery)
- **Source** (hero form vs. CTA form)
- **Timestamp** (when they signed up)
- **Status** (active/inactive)

## 🔍 Testing the Integration

1. **Fill out the form** on your landing page
2. **Check the console** for success/error messages
3. **Verify in Airtable** that the record was created
4. **Check Mailchimp** that the subscriber was added
5. **View Google Analytics** for form submission events

## 🛠️ Troubleshooting

### Common Issues:

**Airtable errors:**
- Verify API key and base ID are correct
- Ensure table name matches exactly
- Check field names match the setup

**Mailchimp errors:**
- Verify API key and server prefix
- Ensure list ID is correct
- Check if email already exists in list

**Google Analytics:**
- Verify measurement ID starts with G-
- Check browser console for gtag errors
- Ensure ad blockers aren't blocking analytics

## 📈 Next Steps

Once everything is working:

1. **Customize email templates** in Mailchimp
2. **Set up automation workflows** for welcome emails
3. **Create Airtable views** for different data analysis
4. **Set up Google Analytics goals** for form submissions
5. **Add form spam protection** (reCAPTCHA)
6. **Implement email verification** if needed

## 🆘 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Test API endpoints individually
4. Check service status pages for Airtable/Mailchimp

---

**Happy collecting! 🌱📧**
