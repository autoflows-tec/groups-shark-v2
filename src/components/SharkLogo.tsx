interface SharkLogoProps {
  className?: string;
}

const SharkLogo = ({ className = "h-8 w-8" }: SharkLogoProps) => {
  return (
    <div className={`${className} relative`}>
      <img 
        src="/shark-logo.jpg" 
        alt="Shark Aceleradora" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default SharkLogo;