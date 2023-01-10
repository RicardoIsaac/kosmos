import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  // use state to control moving components
  const [moveableComponents, setMoveableComponents] = useState([]);
   // use state to have control of the selected elements
  const [selected, setSelected] = useState(null);
  const [number, setNumber] = useState(0)
  const [Url, setUrl] = useState(null)




  
 
//delete the moveable for their id
  const removeMoveable=()=> {
    setMoveableComponents((current)=>current.filter((moveableComponents)=>moveableComponents.id!==selected))  
  } ;
  

  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    fetch("https://jsonplaceholder.typicode.com/photos")
      .then((response) => response.json())
      .then((color) => {
        setUrl(color[number].url)
        console.log(color[number].url)

        setNumber(number+1)
      });

      const COLORS = ["red", "blue", "yellow", "green", "purple"];
      //base structure for element creation, random math is used to choose a random color, width and length.
    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: Math.floor(Math.random() * 100),
        height: Math.floor(Math.random() * 100),
        url:Url,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true
      },
    ]);
  };
 
  //update the lost of moviable
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main style={{ height : "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <button onClick={removeMoveable} >Remove Moveable1</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
          
          
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  url,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
}) => {
  const ref = useRef();
  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    url,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();
  
  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;
    
    if (positionMaxTop > parentBounds?.height)
    newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
    newWidth = parentBounds?.width - left;
    
    
    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
      url,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };
    //update final change
  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;
    
    if (positionMaxTop > parentBounds?.height)
    newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
    newWidth = parentBounds?.width - left;
    
    console.log(newHeight)
    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top;
    const absoluteLeft = left ;
    
    // beforeTranslate[0] acumula el error de movimiento
    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
        url
      },
      true
    );
  
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
          url:url
          
        }}
        onClick={() => setSelected(id)}
      />

      <Moveable
        target={isSelected && ref.current}
        
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={true}


        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
