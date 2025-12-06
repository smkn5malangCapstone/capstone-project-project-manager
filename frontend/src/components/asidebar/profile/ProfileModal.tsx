// src/components/asidebar/profile/ProfileModal.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProfileContent from './ProfileContent';

interface ProfileModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, setIsOpen }) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Pengaturan Profil
          </DialogTitle>
        </DialogHeader>
        <ProfileContent onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;