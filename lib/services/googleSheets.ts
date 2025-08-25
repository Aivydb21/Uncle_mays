import { google } from 'googleapis'

export interface SubscriptionData {
  email: string
  zipCode: string
  interests: string[]
  source: 'hero' | 'cta'
  timestamp: string
}

export class GoogleSheetsService {
  private static sheets = google.sheets({ version: 'v4' })
  private static spreadsheetId: string
  private static range: string

  static initialize(spreadsheetId: string, sheetName: string = 'Sheet1') {
    this.spreadsheetId = spreadsheetId
    this.range = `${sheetName}!A:F`
  }

  static async createSubscription(data: SubscriptionData): Promise<boolean> {
    try {
      if (!this.spreadsheetId) {
        throw new Error('Google Sheets not initialized. Set SPREADSHEET_ID in environment variables.')
      }

      const values = [
        [
          data.email,
          data.zipCode,
          data.interests.join(', '),
          data.source,
          data.timestamp,
          'Active'
        ]
      ]

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: this.range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: values
        }
      })

      console.log('✅ Subscription saved to Google Sheets:', data.email)
      return true
    } catch (error) {
      console.error('❌ Error saving to Google Sheets:', error)
      return false
    }
  }

  static async checkExistingSubscription(email: string): Promise<boolean> {
    try {
      if (!this.spreadsheetId) {
        return false
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.range
      })

      const rows = response.data.values || []
      
      // Check if email already exists (skip header row)
      return rows.slice(1).some(row => row[0] === email)
    } catch (error) {
      console.error('❌ Error checking existing subscription:', error)
      return false
    }
  }

  static async updateSubscription(email: string, data: Partial<SubscriptionData>): Promise<boolean> {
    try {
      if (!this.spreadsheetId) {
        return false
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.range
      })

      const rows = response.data.values || []
      const rowIndex = rows.findIndex(row => row[0] === email)
      
      if (rowIndex === -1) {
        return false
      }

      // Update the row (add 1 because sheets are 1-indexed)
      const updateRange = `${this.range.split('!')[0]}!A${rowIndex + 1}:F${rowIndex + 1}`
      
      const updateValues = [
        [
          email,
          data.zipCode || rows[rowIndex][1],
          data.interests?.join(', ') || rows[rowIndex][2],
          data.source || rows[rowIndex][3],
          rows[rowIndex][4], // Keep original timestamp
          'Active'
        ]
      ]

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: updateRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: updateValues
        }
      })

      console.log('✅ Subscription updated in Google Sheets:', email)
      return true
    } catch (error) {
      console.error('❌ Error updating subscription:', error)
      return false
    }
  }

  static async getSubscriptions(): Promise<SubscriptionData[]> {
    try {
      if (!this.spreadsheetId) {
        return []
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.range
      })

      const rows = response.data.values || []
      
      // Skip header row and convert to SubscriptionData objects
      return rows.slice(1).map(row => ({
        email: row[0] || '',
        zipCode: row[1] || '',
        interests: row[2] ? row[2].split(', ') : [],
        source: (row[3] as 'hero' | 'cta') || 'hero',
        timestamp: row[4] || '',
        status: row[5] || 'Active'
      }))
    } catch (error) {
      console.error('❌ Error getting subscriptions:', error)
      return []
    }
  }
}
