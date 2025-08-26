import mailchimp from '@mailchimp/mailchimp_marketing'

if (!process.env.MAILCHIMP_API_KEY) {
  throw new Error('MAILCHIMP_API_KEY is required')
}

if (!process.env.MAILCHIMP_SERVER_PREFIX) {
  throw new Error('MAILCHIMP_SERVER_PREFIX is required')
}

if (!process.env.MAILCHIMP_LIST_ID) {
  throw new Error('MAILCHIMP_LIST_ID is required')
}

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
})

export interface MailchimpSubscriber {
  email: string
  zipCode: string
  interests: string[]
  source: 'hero' | 'cta'
}

export class MailchimpService {
  static async addSubscriber(data: MailchimpSubscriber): Promise<boolean> {
    try {
      // Prepare merge fields for Mailchimp
      const mergeFields: any = {
        ZIPCODE: data.zipCode,
        SOURCE: data.source,
        INTERESTS: data.interests.join(', '),
        SIGNUP_DATE: new Date().toISOString().split('T')[0]
      }

      // Add interest groups if you have them set up in Mailchimp
      const interests: any = {}
      if (data.interests.includes('popups')) {
        interests['popup_notifications'] = true
      }
      if (data.interests.includes('delivery')) {
        interests['produce_delivery'] = true
      }

      await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID!, {
        email_address: data.email,
        status: 'subscribed',
        merge_fields: mergeFields,
        interests: interests,
        tags: ['Uncle Mays Produce', 'Demand Testing']
      })

      console.log('✅ Subscriber added to Mailchimp:', data.email)
      return true
    } catch (error: any) {
      // Handle specific Mailchimp errors
      if (error.response?.body?.title === 'Member Exists') {
        console.log('ℹ️ Subscriber already exists in Mailchimp:', data.email)
        return true // Consider this a success
      }
      
      console.error('❌ Error adding to Mailchimp:', error)
      return false
    }
  }

  static async sendWelcomeEmail(email: string): Promise<boolean> {
    try {
      // You can customize this based on your Mailchimp automation setup
      // For now, we'll just log that we would send a welcome email
      console.log('📧 Would send welcome email to:', email)
      
      // TODO: Implement actual welcome email sending
      // This could be done through Mailchimp's API or by triggering an automation
      
      return true
    } catch (error) {
      console.error('❌ Error sending welcome email:', error)
      return false
    }
  }

  static async getListStats(): Promise<any> {
    try {
      // Note: getList method doesn't exist in current Mailchimp API
      // This would need to be implemented with the correct API endpoint
      return {
        totalSubscribers: 0,
        unsubscribeCount: 0,
        lastSubscriber: null
      }
    } catch (error) {
      console.error('❌ Error getting list stats:', error)
      return null
    }
  }
}
