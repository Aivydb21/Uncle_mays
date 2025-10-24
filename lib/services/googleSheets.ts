import { google } from 'googleapis'

export interface SubscriptionData {
  firstName: string
  email: string
  zipCode: string
  interests: string[]
  source: 'hero' | 'cta'
  timestamp: string
}

export class GoogleSheetsService {
  private static sheets: any
  private static spreadsheetId: string
  private static range: string

  static initialize(spreadsheetId: string, sheetName: string = 'Sheet1') {
    this.spreadsheetId = spreadsheetId
    this.range = sheetName
    
    // Set up Google Sheets authentication
    const auth = new google.auth.GoogleAuth({
      credentials: {
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    this.sheets = google.sheets({ version: 'v4', auth })
  }

  // Helper method to get properly formatted range
  private static getFormattedRange(suffix: string = ''): string {
    // For Google Sheets API, just use the sheet name without quotes
    const sheetName = this.range
    const result = suffix ? `${sheetName}!${suffix}` : sheetName
    console.log('🔧 Range formatting:', { original: this.range, sheetName, suffix, result })
    return result
  }

  static async createSubscription(data: SubscriptionData): Promise<boolean> {
    try {
      if (!this.spreadsheetId) {
        throw new Error('Google Sheets not initialized. Set SPREADSHEET_ID in environment variables.')
      }

      const values = [
        [
          data.firstName,
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
        range: this.getFormattedRange('A:G')
      })

      const rows = response.data.values || []
      
      // Check if email already exists (skip header row)
      return rows.slice(1).some((row: any[]) => row[1] === email)
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
        range: this.getFormattedRange('A:G')
      })

      const rows = response.data.values || []
      const rowIndex = rows.findIndex((row: any[]) => row[1] === email)
      
      if (rowIndex === -1) {
        return false
      }

      // Update the row (add 1 because sheets are 1-indexed)
      const updateRange = `${this.getFormattedRange()}!A${rowIndex + 1}:G${rowIndex + 1}`
      
      const updateValues = [
        [
          data.firstName || rows[rowIndex][0],
          email,
          data.zipCode || rows[rowIndex][2],
          data.interests?.join(', ') || rows[rowIndex][3],
          data.source || rows[rowIndex][4],
          rows[rowIndex][5], // Keep original timestamp
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
        range: this.getFormattedRange('A:F')
      })

      const rows = response.data.values || []
      
      // Skip header row and convert to SubscriptionData objects
      return rows.slice(1).map((row: any[]) => ({
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

