import React, { useState, useRef, useEffect } from "react";
import parse from "@bany/curl-to-json";
import "./bulma.min.css";
import "./App.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Confetti from "react-confetti";
import curlSuper from "./curlsuper.png";
import "animate.css";
import FlyingText from "./FlyingText";

function App() {
  const [curlInput, setCurlInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const buttonRef = useRef(null);
  const [showFlyingText, setShowFlyingText] = useState(false);

  const handleInputChange = (event) => {
    setCurlInput(event.target.value);
  };

  const handleFlyingTextComplete = () => {
    setShowFlyingText(false);
  };

  const handleCopy = () => {
    setCopied(true);
  };

  const convertCurlToSupertest = () => {
    try {
      if (curlInput.trim().indexOf(" ") === -1) {
        throw new Error("Invalid cURL format");
      }
      const result = parse(curlInput);
      if (result.form && Array.isArray(result.form)) {
        const formObject = {};
        result.form.forEach((field) => {
          const [key, value] = field.split("=");
          formObject[key] = value.replace(/^"(.*)"$/, "$1");
        });
        result.form = formObject;
      }

      const requestMethod = result.method ? result.method.toLowerCase() : "get";

      let supertestUrl;
      if (result.location) {
        supertestUrl = result.location;
      }
      if (!supertestUrl && result.url) {
        supertestUrl = result.url;
      }
      supertestUrl = supertestUrl ? `'${supertestUrl}'` : "undefined";
      const dataField = result.data
        ? JSON.stringify(result.data, null, 2)
        : "''";

      const supertestHeader = result.header
        ? Object.entries(result.header).map(
            ([key, value]) => `.set("${key}", "${value}")`
          )
        : [];

      let supertestCode = `const res = await supertest(${supertestUrl})\n.${requestMethod}('')\n`;

      if (supertestHeader.length > 0) {
        supertestHeader[supertestHeader.length - 1] += "\n";
        supertestCode += supertestHeader.join("\n");
      }

      if (result.form) {
        const formData = Object.entries(result.form)
          .map(([key, value]) => `.field('${key}', '${value}')`)
          .join("\n");
        supertestCode += formData;
      } else {
        supertestCode += `.send(${dataField})`;
      }
      supertestCode += `\nreturn res`;

      setOutput(supertestCode);
      setCopied(false);
      setShowConfetti(true);
      console.log(localStorage.getItem("hasShownFlyingText"));
      if (localStorage.getItem("hasShownFlyingText") === "true") {
        setShowFlyingText(false);
      } else {
        setShowFlyingText(true);
        localStorage.setItem("hasShownFlyingText", "true");
      }
    } catch (error) {
      setOutput("Bukan cURL, ckckckck");
    }
  };

  const calculateButtonPosition = () => {
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const x = buttonRect.left + buttonRect.width / 2;
    const y = buttonRect.top + buttonRect.height / 2;
    return { x, y };
  };

  useEffect(() => {
    const hasShownFlyingText = localStorage.getItem("hasShownFlyingText");
    if (hasShownFlyingText === null) {
      setShowFlyingText(false);
    } else {
      localStorage.removeItem("hasShownFlyingText");
    }
  }, []);

  return (
    <div>
      <div className="container has-text-centered">
        <div className="columns is-centered">
          <div className="column is-half">
            <br />
            <br />
            <img
              src={curlSuper}
              width={150}
              className="animate__animated animate__bounceInDown"
              alt="logo"
            />
            <br />
            <h2 className="title is-4 has-text-centered animate__animated animate__fadeInUp">
              cURL to Supertest Converter
            </h2>
            <p className="animate__animated animate__fadeIn animate__slow">
              Convert CURL from postman into supertest http format for Mocha,
              Jest, and many more
            </p>
            <br />
            <div className="field">
              <div className="control">
                <textarea
                  className="textarea"
                  rows={10}
                  cols={80}
                  value={curlInput}
                  onChange={handleInputChange}
                  placeholder="Enter your cURL command here..."
                />
              </div>
            </div>
            <div className="field is-grouped is-justify-content-center">
              <div className="control">
                <button
                  ref={buttonRef}
                  className="button is-primary"
                  onClick={convertCurlToSupertest}
                >
                  Convert!
                </button>
                {showFlyingText && (
                  <FlyingText
                    text="awikwok 🗿"
                    onComplete={handleFlyingTextComplete}
                  />
                )}
              </div>
            </div>
            <div
              className="control"
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "'Karla', sans-serif",
              }}
            >
              <SyntaxHighlighter
                language="javascript"
                style={a11yDark}
                wrapLongLines
              >
                {output}
              </SyntaxHighlighter>
              <br />
              <CopyToClipboard text={output} onCopy={handleCopy}>
                <button
                  className={`button custom-rounded has-text-weight-medium ${
                    copied ? "is-success" : "is-primary"
                  }`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </CopyToClipboard>
              <br />
              <br />
            </div>
          </div>
        </div>
      </div>
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={100}
          confettiSource={calculateButtonPosition()}
        />
      )}
      <footer className="footer has-text-black">
        <div className="content has-text-centered">
          <p className="is-size-7 animate__animated animate__fadeIn animate__slow animate__delay-1s">
            Created by{" "}
            <a href="https://www.linkedin.com/in/hilalmustofa">mzhll</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;