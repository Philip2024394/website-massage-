import React, { useMemo, useState } from 'react';
import type { Therapist } from '../../types';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  LinkedinShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
  LinkedinIcon,
  EmailIcon,
} from 'react-share';
import { generateTherapistShareURL, generateShareText, copyShareURLToClipboard } from './utils/shareUrlBuilder';

interface ShareActionsProps {
  therapist: Therapist;
}

const ShareActions: React.FC<ShareActionsProps> = ({ therapist }) => {
  const shareUrl = useMemo(() => generateTherapistShareURL(therapist), [therapist]);
  const shareText = useMemo(() => generateShareText(therapist.name, 'therapist', therapist.location), [therapist]);
  const [copied, setCopied] = useState<boolean>(false);

  const onCopy = async () => {
    const ok = await copyShareURLToClipboard(shareUrl);
    setCopied(ok);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-6">
      <div className="text-center mb-3">
        <button
          onClick={onCopy}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <span>Copy Share Link</span>
          {copied && <span className="text-white/90 text-sm">✓ Copied</span>}
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <FacebookShareButton url={shareUrl} quote={shareText}>
          <FacebookIcon size={40} round />
        </FacebookShareButton>
        <TwitterShareButton url={shareUrl} title={shareText}>
          <TwitterIcon size={40} round />
        </TwitterShareButton>
        <WhatsappShareButton url={shareUrl} title={shareText} separator=" - ">
          <WhatsappIcon size={40} round />
        </WhatsappShareButton>
        <TelegramShareButton url={shareUrl} title={shareText}>
          <TelegramIcon size={40} round />
        </TelegramShareButton>
        <LinkedinShareButton url={shareUrl} title={shareText} summary={shareText}>
          <LinkedinIcon size={40} round />
        </LinkedinShareButton>
        <EmailShareButton url={shareUrl} subject={`IndaStreet Massage: ${therapist.name}`} body={`${shareText}\n\n${shareUrl}`}>
          <EmailIcon size={40} round />
        </EmailShareButton>
      </div>
    </div>
  );
};

export default ShareActions;