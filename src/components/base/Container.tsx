


interface Props {
  children: React.ReactNode;
}

const Container: React.FC<Props> = ({ children }) => {
  const stainedGradientStyle = {
    backgroundImage: `
    radial-gradient(circle at 20% 35%, #F2F6EF, transparent 50%),
    radial-gradient(circle at 75% 44%, #ddf2f3, transparent 50%),
    radial-gradient(circle at 60% 70%, #b8f1f3, transparent 50%),
    linear-gradient(to right, #f4d6e1, #e9ecef)
  `,
  };

  return (
    <main style={stainedGradientStyle} className="relative flex min-h-screen flex-col items-center justify-start p-2">
      <div className="max-w-6xl w-full">
        <div className="w-full items-center justify-between font-mono text-sm lg:flex">
          {children}
        </div>
      </div>
    </main>
  );
};

export default Container;