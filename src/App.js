import "./App.css";
import Scatter from "./components/Scatter";
import React from "react";

function App() {
    const measuredRef = React.useCallback((node) => {
        if (!node) return;
        const resizeObserver = new ResizeObserver(() => {
            console.log(Math.ceil(node.getBoundingClientRect().height));
            window.parent.postMessage(
                {
                    sentinel: "amp",
                    type: "embed-size",
                    height: Math.ceil(node.getBoundingClientRect().height),
                    src: document.location.href,
                },
                "*"
            );
        });
        resizeObserver.observe(node);
    }, []);

    return (
        <div ref={measuredRef} className="App">
            <Scatter />
        </div>
    );
}

export default App;
