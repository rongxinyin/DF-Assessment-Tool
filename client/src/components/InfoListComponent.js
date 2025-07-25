// src/components/FAQ.js
import React, { useState } from "react";
import { Button, Typography } from "@mui/material";

const InfoListComponent = ({ data }) => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleQuestion = (index) => {
        if (openIndex === index) {
            setOpenIndex(null);
        } else {
            setOpenIndex(index);
        }
    };

    return (
        <div className="InfoListComponent">
            {data.map((item, index) => (
                <div key={index} color="typography.primary.main">
                    <Button
                        style={{
                            borderRadius: 35,
                            backgroundColor: "secondary",
                            fontSize: "18px",
                            padding: "18px 36px",
                            marginBottom: 5,
                        }}
                        color="inherit"
                        variant="outlined"
                        onClick={() => toggleQuestion(index)}
                    >
                        {item.question}
                    </Button>
                    {openIndex === index && (
                        <p color="typography.primary.main">
                            {item.answer}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default InfoListComponent;
