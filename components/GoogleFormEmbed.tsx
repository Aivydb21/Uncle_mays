'use client'

interface GoogleFormEmbedProps {
  variant?: 'hero' | 'cta'
  className?: string
}

export function GoogleFormEmbed({ variant = 'hero', className = '' }: GoogleFormEmbedProps) {
  const isHero = variant === 'hero'
  const isCTA = variant === 'cta'

  return (
    <div className={className}>
      {isHero && (
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2 text-foreground">Stay Connected</h3>
          <p className="text-sm text-muted-foreground">
            Join our community and get updates on Uncle Mays Produce
          </p>
        </div>
      )}

      <div className="flex justify-center">
        <div className={`w-full ${isHero ? 'max-w-2xl' : 'max-w-lg'}`}>
          <iframe 
            src="https://docs.google.com/forms/d/e/1FAIpQLSfmaSTz-8JuH3RXsL3sCBakVjBcqGQML6muiYeFOdLQ-FwqoA/viewform?embedded=true" 
            width="100%" 
            height={isHero ? 946 : 600} 
            frameBorder="0" 
            marginHeight="0" 
            marginWidth="0"
            className="rounded-lg shadow-lg border border-border/50"
            title="Uncle Mays Produce Subscription Form"
          >
            Loading…
          </iframe>
        </div>
      </div>

      {isHero && (
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Supporting Black farmers and community. Unsubscribe anytime.
        </p>
      )}
    </div>
  )
}
