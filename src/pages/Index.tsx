import { useState } from "react";

const FORTUNE_TELLERS = [
  {
    id: "classic",
    name: "Κλασική Καφετζού",
    desc: "παραδοσιακό, ζεστό ύφος",
    img: "/assets/kafetzou-classic.png",
  },
  {
    id: "young",
    name: "Νεαρή Καφετζού",
    desc: "ανάλαφρο, παιχνιδιάρικο ύφος",
    img: "/assets/kafetzou-young.png",
  },
  {
    id: "mystic",
    name: "Μυστική Μάντισσα",
    desc: "ποιητικό, μυσταγωγικό ύφος",
    img: "/assets/kafetzou-mystic.png",
  },
] as const;

type PersonaId = typeof FORTUNE_TELLERS[number]["id"];

export default function IndexPage() {
  const [pickerOpen, setPickerOpen] = useState(true);
  const [persona, setPersona] = useState<PersonaId>("classic");
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("35-44");
  const [topic, setTopic] = useState("spiritual");
  const [question, setQuestion] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const startReading = () => {
    console.log({ persona, gender, age, topic, question, file });
    alert("Η ανάγνωση ξεκινά! Δες console για τα δεδομένα.");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fdf7fb", color: "#333" }}>
