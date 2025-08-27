# 🚀 Social Media Optimization Guide for UNCLE MAY'S

## 📱 Facebook Meta Tags & Social Media Integration

Your website now includes comprehensive social media optimization to help with demand testing and marketing campaigns.

## ✅ What's Been Added

### 1. **Open Graph Meta Tags (Facebook/LinkedIn)**
- **Page Title**: Optimized for social sharing
- **Description**: Compelling copy for social feeds
- **Images**: Multiple high-quality images for sharing
- **Business Information**: Complete business details

### 2. **Twitter Card Meta Tags**
- **Large Image Cards**: Eye-catching social media previews
- **Optimized Descriptions**: Perfect for Twitter engagement
- **Hashtag Suggestions**: Built-in for better discoverability

### 3. **Structured Data (JSON-LD)**
- **Local Business Schema**: Rich snippets in search results
- **Business Information**: Hours, location, contact details
- **Product Catalog**: Produce boxes and services
- **Reviews & Ratings**: Social proof for customers

### 4. **Social Share Buttons**
- **Facebook, Twitter, LinkedIn**: Direct sharing to major platforms
- **Email Sharing**: Easy forwarding to friends/family
- **Copy Link**: Simple URL sharing
- **Mobile Native Sharing**: Uses device's built-in share features

### 5. **Facebook Pixel Integration**
- **Conversion Tracking**: Form submissions and leads
- **Page View Tracking**: User behavior analysis
- **Custom Events**: Produce box interest, community engagement
- **Retargeting**: Build audiences for Facebook ads

## 🔧 Setup Instructions

### **1. Update Your Domain**
In `app/layout.tsx`, replace `https://unclemays.com` with your actual domain:
```typescript
url: 'https://your-actual-domain.com',
```

### **2. Add Facebook Pixel ID**
1. **Go to**: [Facebook Business Manager](https://business.facebook.com/)
2. **Create/Select**: Your business account
3. **Go to**: Events Manager → Data Sources → Pixels
4. **Copy**: Your Pixel ID
5. **Update**: `.env.local` file:
```bash
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789012345
```

### **3. Update Social Media Handles**
In `app/layout.tsx`, replace placeholder handles:
```typescript
sameAs: [
  "https://facebook.com/your-actual-handle",
  "https://instagram.com/your-actual-handle", 
  "https://twitter.com/your-actual-handle"
],
```

### **4. Update Business Information**
Replace placeholder data with actual information:
```typescript
'business:contact_data:street_address': 'Your Actual Address',
'business:contact_data:phone_number': '+1-XXX-XXX-XXXX',
'business:contact_data:email': 'your-email@domain.com',
'business:contact_data:website': 'https://your-domain.com',
'business:contact_data:hours': 'Your Actual Hours',
```

## 📊 Demand Testing Features

### **1. Social Sharing Analytics**
- **Track shares** across all platforms
- **Monitor engagement** rates
- **Measure viral coefficient** of your content

### **2. Facebook Pixel Events**
- **Page Views**: Track which pages get most traffic
- **Form Submissions**: Monitor lead generation
- **Produce Box Interest**: Track product engagement
- **Community Engagement**: Measure social interaction

### **3. Conversion Tracking**
- **Lead Generation**: Form submissions to Google Sheets
- **Social Proof**: Share counts and engagement
- **Audience Building**: Retargeting opportunities

## 🎯 Marketing Campaign Ideas

### **1. Facebook Ads**
- **Target**: Local Chicago residents
- **Interests**: Black-owned businesses, local produce, community
- **Lookalike Audiences**: Based on your subscribers
- **Retargeting**: People who visited but didn't subscribe

### **2. Social Media Content**
- **Share Stories**: About Black farmers you work with
- **Behind the Scenes**: Show your community impact
- **Customer Testimonials**: Social proof from your community
- **Produce Spotlights**: Feature different fruits/vegetables

### **3. Community Engagement**
- **Local Events**: Partner with community organizations
- **Farmer Spotlights**: Feature the farmers you work with
- **Educational Content**: About sustainable farming, Black farming history

## 📈 Measuring Success

### **1. Key Metrics to Track**
- **Social Shares**: How often your content is shared
- **Form Submissions**: Lead generation rate
- **Page Views**: Traffic to different sections
- **Engagement Rate**: Comments, likes, shares

### **2. Facebook Analytics**
- **Audience Insights**: Who's interested in your business
- **Conversion Tracking**: ROI on marketing spend
- **Custom Audiences**: Build lists for retargeting

### **3. Google Analytics**
- **Traffic Sources**: Where your visitors come from
- **User Behavior**: How people interact with your site
- **Conversion Funnel**: From visitor to subscriber

## 🚀 Next Steps

### **1. Immediate Actions**
- [ ] Update domain in meta tags
- [ ] Add Facebook Pixel ID
- [ ] Update social media handles
- [ ] Add actual business information

### **2. Testing Phase**
- [ ] Test social sharing on all platforms
- [ ] Verify Facebook Pixel is tracking events
- [ ] Check meta tags with Facebook Debugger
- [ ] Test Twitter Card Validator

### **3. Launch Campaigns**
- [ ] Create Facebook Lookalike Audiences
- [ ] Set up retargeting campaigns
- [ ] Launch community engagement posts
- [ ] Monitor and optimize performance

## 🔍 Tools for Testing

### **1. Facebook Debugger**
- **URL**: [developers.facebook.com/tools/debug/](https://developers.facebook.com/tools/debug/)
- **Purpose**: Test Open Graph tags and refresh cache

### **2. Twitter Card Validator**
- **URL**: [cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator)
- **Purpose**: Test Twitter Card meta tags

### **3. LinkedIn Post Inspector**
- **URL**: [www.linkedin.com/post-inspector/](https://www.linkedin.com/post-inspector/)
- **Purpose**: Test LinkedIn sharing preview

### **4. Google Rich Results Test**
- **URL**: [search.google.com/test/rich-results](https://search.google.com/test/rich-results)
- **Purpose**: Test structured data implementation

## 💡 Pro Tips

### **1. Image Optimization**
- **Use 1200x630px images** for optimal social sharing
- **Keep file sizes under 1MB** for fast loading
- **Include alt text** for accessibility and SEO

### **2. Content Strategy**
- **Share consistently** across all platforms
- **Use relevant hashtags** for discoverability
- **Engage with your community** regularly
- **Monitor mentions** and respond promptly

### **3. Performance Optimization**
- **Test loading speed** on mobile devices
- **Optimize images** for web use
- **Monitor Core Web Vitals** in Google Search Console

---

## 🎉 You're All Set!

Your UNCLE MAY'S website now has enterprise-level social media optimization that will help you:
- **Generate more leads** through social sharing
- **Build your community** across all platforms
- **Track performance** with detailed analytics
- **Scale your marketing** with data-driven insights

Start testing your social sharing today and watch your community grow! 🌱


