import { useState, useEffect, useRef, useCallback } from "react"
import { Copy, Check, RefreshCw } from "lucide-react"
import { toast } from 'sonner'
import { generateShareLink, getShareLink, revokeShareLink } from "@/services"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ShareListDialogProps {
  wishlistId: number
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareListDialog({ wishlistId, isOpen, onOpenChange }: ShareListDialogProps) {
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [isLoadingShare, setIsLoadingShare] = useState(false)
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const loadShareLink = useCallback(async () => {
    setIsLoadingShare(true)
    try {
      const link = await getShareLink(wishlistId)
      if (link) {
        const url = `${window.location.origin}/wishlists/shared/${link.share_token}`
        setShareLink(url)
      } else {
        setShareLink(null)
      }
    } catch (error) {
      console.error('Error loading share link', error)
    } finally {
      setIsLoadingShare(false)
    }
  }, [wishlistId])

  useEffect(() => {
    if (isOpen) {
      loadShareLink()
    }
  }, [isOpen, loadShareLink])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  // Reset copied state and clear timeout when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
        copyTimeoutRef.current = null
      }
      setCopied(false)
    }
  }, [isOpen])

  const handleGenerateLink = async (showToast: boolean = true) => {
    setIsLoadingShare(true)
    try {
      const link = await generateShareLink(wishlistId)
      const url = `${window.location.origin}/wishlists/shared/${link.share_token}`
      setShareLink(url)
      if (showToast) {
        toast.success("Share link generated!")
      }
    } catch (error) {
      console.error('Error generating share link', error)
      toast.error("Failed to generate share link. Please try again.")
    } finally {
      setIsLoadingShare(false)
    }
  }

  const handleCopyLink = async () => {
    if (shareLink) {
      try {
        await navigator.clipboard.writeText(shareLink)
        setCopied(true)
        toast.success("Link copied to clipboard!")
        
        // Clear any existing timeout
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current)
        }
        
        // Store the new timeout ID
        copyTimeoutRef.current = setTimeout(() => {
          setCopied(false)
          copyTimeoutRef.current = null
        }, 2000)
      } catch (error) {
        console.error('Error copying to clipboard', error)
        toast.error("Failed to copy link. Please try again.")
      }
    }
  }

  const handleRegenerateLink = async () => {
    if (!shareLink) return
    
    setIsLoadingShare(true)
    try {
      // Extract token from URL
      const token = shareLink.split('/').pop()
      if (token) {
        await revokeShareLink(token)
      }
      await handleGenerateLink(false)
      toast.success("Share link regenerated!")
    } catch (error) {
      console.error('Error regenerating share link', error)
      toast.error("Failed to regenerate share link. Please try again.")
    } finally {
      setIsLoadingShare(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center"> 
            <span>Share Wishlist</span>
          </DialogTitle>
          <DialogDescription>
            Share this wishlist with friends and family. Anyone with the link can view it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {isLoadingShare ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : shareLink ? (
            <>
              <div className="flex gap-2">
                <Input 
                  value={shareLink} 
                  readOnly 
                  className="flex-1"
                />
                <Button 
                  onClick={handleCopyLink}
                  variant="outline"
                  size="icon"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleRegenerateLink}
                  variant="outline"
                  className="flex-1"
                  disabled={isLoadingShare}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate Link
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Regenerating will revoke the old link and create a new one. The old link will stop working.
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No share link exists for this wishlist yet. Generate one to share with others.
              </p>
              <Button 
                onClick={() => handleGenerateLink()}
                disabled={isLoadingShare}
                className="w-full"
              >
                Generate Share Link
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

