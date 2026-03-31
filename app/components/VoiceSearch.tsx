"use client"

import { useState } from "react"
import { FaMicrophone } from "react-icons/fa"

export default function VoiceSearch() {

  const [text, setText] = useState("")

  const startListening = () => {

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("Speech recognition not supported")
      return
    }

    const recognition = new SpeechRecognition()

    recognition.lang = "en-US"

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setText(transcript)
    }

    recognition.start()
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      marginTop: "40px"
    }}>
      
      <div style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #ccc",
        borderRadius: "30px",
        padding: "12px 18px",
        width: "350px",
        background: "white"
      }}>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search crops, products..."
          style={{
            border: "none",
            outline: "none",
            flex: 1,
            fontSize: "15px",
            color: "black"
          }}
        />

        <FaMicrophone
          onClick={startListening}
          style={{
            cursor: "pointer",
            fontSize: "18px",
            color: "black"
          }}
        />

      </div>
    </div>
  )
}