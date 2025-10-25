import { useState, useEffect, useCallback } from "react"
import { motion } from "motion/react"
import { MoreHorizontal, TriangleAlert, Copy, Check, RefreshCw } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { toast } from 'sonner';
import { deleteWishlist, generateShareLink, getShareLink, revokeShareLink } from "@/services"
import { Database } from "@/database.types"
import { cardHover } from "@/lib/motion"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EditList } from "@/components/modules/EditList/EditList"
import { Input } from "@/components/ui/input"

type WishlistCard = Database['public']['Tables']['wishlists']['Row'] & {
  items: number
}

interface WishlistCardProps {
  list: WishlistCard
  refetchWishlists: () => void
}

export function WishlistCard({ list, refetchWishlists }: WishlistCardProps) {
  const [actionModal, setActionModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isLoadingShare, setIsLoadingShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadShareLink = useCallback(async () => {
    setIsLoadingShare(true);
    try {
      const link = await getShareLink(list.id);
      if (link) {
        const url = `${window.location.origin}/wishlists/shared/${link.share_token}`;
        setShareLink(url);
      } else {
        setShareLink(null);
      }
    } catch (error) {
      console.error('Error loading share link', error);
    } finally {
      setIsLoadingShare(false);
    }
  }, [list.id]);

  useEffect(() => {
    if (shareModal) {
      loadShareLink();
    }
  }, [shareModal, loadShareLink]);

  const handleGenerateLink = async () => {
    setIsLoadingShare(true);
    try {
      const link = await generateShareLink(list.id);
      const url = `${window.location.origin}/wishlists/shared/${link.share_token}`;
      setShareLink(url);
      toast.success("Share link generated!");
    } catch (error) {
      console.error('Error generating share link', error);
      toast.error("Failed to generate share link. Please try again.");
    } finally {
      setIsLoadingShare(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      try {
        await navigator.clipboard.writeText(shareLink);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error copying to clipboard', error);
        toast.error("Failed to copy link. Please try again.");
      }
    }
  };

  const handleRegenerateLink = async () => {
    if (!shareLink) return;
    
    setIsLoadingShare(true);
    try {
      // Extract token from URL
      const token = shareLink.split('/').pop();
      if (token) {
        await revokeShareLink(token);
      }
      await handleGenerateLink();
      toast.success("Share link regenerated!");
    } catch (error) {
      console.error('Error regenerating share link', error);
      toast.error("Failed to regenerate share link. Please try again.");
    } finally {
      setIsLoadingShare(false);
    }
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const openEditModal = (e: React.MouseEvent) => {
    handleDropdownClick(e);
    setEditModal(true);
  }

  const openShareModal = (e: React.MouseEvent) => {
    handleDropdownClick(e);
    setShareModal(true);
  }

  const openDeleteModal = (e: React.MouseEvent) => {
    handleDropdownClick(e);
    setActionModal(true);
  }

  const deleteList = () => {
    setIsDeleting(true);
    deleteWishlist(Number(list.id)).then(() => {
      refetchWishlists();
      toast.success("Wishlist deleted successfully!");
    }).catch((error) => {
      console.error('Error deleting wishlist', error);
      toast.error("Failed to delete wishlist. Please try again.");
    }).finally(() => {
      setIsDeleting(false);
      setActionModal(false);
    });
  }

  return (
    <motion.div
      variants={cardHover}
      whileHover="hover"
    >
      <Link
        to="/wishlists/$id"
        params={{ id: list.uuid }}
        className="block"
      >
        <Card
          className="p-4 overflow-hidden transition-all duration-200 hover:shadow-md bg-card text-card-foreground cursor-pointer h-full flex flex-col"
        >
          <CardHeader className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-medium text-foreground">{list.name}</CardTitle>
              <CardDescription className="text-muted-foreground mt-1 line-clamp-1">{list.description}</CardDescription>
            </div>
            <Dialog open={actionModal} onOpenChange={setActionModal}>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild onClick={handleDropdownClick}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={openEditModal} className="cursor-pointer">Edit List</DropdownMenuItem>
                  <DropdownMenuItem onClick={openShareModal} className="cursor-pointer">
                    Share List
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DialogTrigger asChild>
                    <DropdownMenuItem onClick={openDeleteModal} className="cursor-pointer text-destructive">Delete List</DropdownMenuItem>
                  </DialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
            </Dialog>
          </CardHeader>
          <CardContent>
            {/* <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-5 w-5">
                <AvatarImage src="/placeholder.svg?height=20&width=20" alt={list.ownerName} />
                <AvatarFallback>{list.ownerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">Created by {list.ownerName}</span>
            </div> */}
            <div className="flex justify-between items-center mt-auto">
              <div className="text-sm text-muted-foreground">
                {list.items} {list.items === 1 ? "item" : "items"}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
      <Dialog open={actionModal} onOpenChange={setActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <TriangleAlert className="size-5 text-destructive mr-2" />
              <span>Delete List</span>
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete <strong>"{list.name}"</strong>? This action cannot be undone.
            </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModal(false)}>Cancel</Button>
            <Button disabled={isDeleting} variant="default" onClick={deleteList}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <EditList 
        list={list} 
        isOpen={editModal} 
        onOpenChange={setEditModal} 
        onSuccess={refetchWishlists} 
      />
      <Dialog open={shareModal} onOpenChange={setShareModal}>
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
                  onClick={handleGenerateLink}
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
    </motion.div>
  )
}

