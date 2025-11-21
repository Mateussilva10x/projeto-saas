"use client";
import React, { useState, KeyboardEvent, ChangeEvent } from "react";
import { X } from "lucide-react";
import { Input } from "./ui/input";

interface ThemesInputProps {
  topics: string[];
  setTopics: React.Dispatch<React.SetStateAction<string[]>>;
}

const ThemesInput: React.FC<ThemesInputProps> = ({ topics, setTopics }) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddTopic = () => {
    const topic = inputValue.trim();
    if (topic && !topics.includes(topic)) {
      setTopics([...topics, topic]);
      setInputValue("");
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter((topic) => topic !== topicToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTopic();
    }

    if (e.key === "Backspace" && inputValue === "" && topics.length > 0) {
      handleRemoveTopic(topics[topics.length - 1]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.endsWith(",")) {
      setInputValue(e.target.value.slice(0, -1));
      handleAddTopic();
    } else {
      setInputValue(e.target.value);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-gray-900 dark:text-white text-base font-medium leading-normal"
        htmlFor="themes-input"
      >
        Temas do Documento
      </label>

      <div className="flex flex-col gap-2 rounded-lg border border-gray-900-dark bg-background p-2 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <div
              key={topic}
              className="flex items-center gap-1 bg-primary/20 text-primary-800 dark:bg-primary/30 dark:text-primary-200 rounded-full px-3 py-1 text-sm font-medium"
            >
              <span>{topic}</span>
              <button
                className="dark:text-blue-200 hover:text-white"
                type="button"
                onClick={() => handleRemoveTopic(topic)}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          <Input
            className="flex-1 bg-transparent border-0 focus:ring-0 p-1 min-w-[120px] text-white placeholder:text-gray-500"
            id="themes-input"
            placeholder="Adicionar tema..."
            type="text"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Separe os temas por vírgula ou pressione Enter.
      </p>
    </div>
  );
};

export default ThemesInput;
