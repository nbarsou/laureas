const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      {children}
    </div>
  );
};

export default layout;
