import Airtable from 'airtable'

if (!process.env.AIRTABLE_API_KEY) {
  throw new Error('AIRTABLE_API_KEY is required')
}

if (!process.env.AIRTABLE_BASE_ID) {
  throw new Error('AIRTABLE_BASE_ID is required')
}

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID)
const tableName = process.env.AIRTABLE_TABLE_NAME || 'Subscriptions'

export interface SubscriptionData {
  email: string
  zipCode: string
  interests: string[]
  source: 'hero' | 'cta'
  timestamp: string
}

export class AirtableService {
  static async createSubscription(data: SubscriptionData): Promise<boolean> {
    try {
      await base(tableName).create([
        {
          fields: {
            Email: data.email,
            'Zip Code': data.zipCode,
            'Interests': data.interests.join(', '),
            'Source': data.source,
            'Timestamp': data.timestamp,
            'Status': 'Active'
          }
        }
      ])
      
      console.log('✅ Subscription saved to Airtable:', data.email)
      return true
    } catch (error) {
      console.error('❌ Error saving to Airtable:', error)
      return false
    }
  }

  static async checkExistingSubscription(email: string): Promise<boolean> {
    try {
      const records = await base(tableName).select({
        filterByFormula: `{Email} = '${email}'`
      }).firstPage()
      
      return records.length > 0
    } catch (error) {
      console.error('❌ Error checking existing subscription:', error)
      return false
    }
  }

  static async updateSubscription(email: string, data: Partial<SubscriptionData>): Promise<boolean> {
    try {
      const records = await base(tableName).select({
        filterByFormula: `{Email} = '${email}'`
      }).firstPage()
      
      if (records.length > 0) {
        const recordId = records[0].id
        await base(tableName).update([
          {
            id: recordId,
            fields: {
              'Zip Code': data.zipCode,
              'Interests': data.interests?.join(', '),
              'Last Updated': new Date().toISOString()
            }
          }
        ])
        
        console.log('✅ Subscription updated in Airtable:', email)
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ Error updating subscription:', error)
      return false
    }
  }
}
