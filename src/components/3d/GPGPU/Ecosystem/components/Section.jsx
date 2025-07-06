export const Section = ({ id, activeSceneId }) => {
  const cells = [
    "col-start-5 row-start-6",
    "col-start-5 row-start-2",
    "col-start-5 row-start-4",
    "col-start-3 row-start-6",
    "col-start-1 row-start-4",
    "col-start-1 row-start-2",
    "col-start-3 row-start-2",
    "col-start-1 row-start-6",
  ];
  return (
    <div
      className={cn(
        "absolute grid grid-cols-5  grid-rows-7 w-full  h-full  top-0 overflow-hidden gap-0 ",
        id === activeSceneId && "opacity-100"
      )}
    >
      {cells.map((cell, index) => (
        <div key={index} className={cell}>
          <Logo2D src={"/3rd_Section/" + ref[index].path} />
        </div>
      ))}
    </div>
  );
};
