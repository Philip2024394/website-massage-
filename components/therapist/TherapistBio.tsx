interface TherapistBioProps {
  description: string;
}

const TherapistBio = ({ description }: TherapistBioProps): JSX.Element => {
  return (
    <div className="therapist-bio-section bg-white/90 backdrop-blur-sm rounded-lg py-2 px-3 shadow-sm mx-4">
      <p className="text-sm text-gray-700 leading-5 break-words whitespace-normal line-clamp-6">{description}</p>
    </div>
  );
};

export default TherapistBio;
