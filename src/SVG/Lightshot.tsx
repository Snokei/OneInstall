
const Lightshot = ({ width, height, className }: { width?: number; height?: number; className?: string }) => {
  return (
    <img src="https://www.google.com/s2/favicons?domain=app.prntscr.com&sz=128" width={width} height={height} className={className} alt="Lightshot" />
  );
};

export default Lightshot;
