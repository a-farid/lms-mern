import { useState, useEffect } from 'react';
    
const [configuration, setConfiguration] = useState([]);

async function getConfiguration() {
    try {
        const response = await ``fetch(`${process.env.NEXT_PUBLIC_URL}/api/Configuration`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setConfiguration(data);
    } catch (error) {
        console.error('Failed to fetch configuration:', error);
    }
}

useEffect(() => {
    getConfiguration();
}, []);