import React from "react";
import ModalVideo from "react-modal-video";

export interface VideoPopupProps {
  isVideoOpen: boolean;
  setIsVideoOpen: (open: boolean) => void;
  /** YouTube video id */
  videoId?: string;
}

// WHY: no `autoplay` prop: react-modal-video 2 never read a top-level autoplay; YouTube autoplay is on by default
const VideoPopup = ({ isVideoOpen, setIsVideoOpen, videoId = "bgMEvrd2E" }: VideoPopupProps) => {
  return (
    <>
      <ModalVideo channel="youtube" isOpen={isVideoOpen} videoId={videoId} onClose={() => setIsVideoOpen(false)} />
    </>
  );
};

export default VideoPopup;
