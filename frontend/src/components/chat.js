    import React, { useState, useEffect } from 'react';
    import { useParams } from 'react-router-dom';
    import io from 'socket.io-client';
    import axios from 'axios';
    const ChatPage = () => {
    const {id} = useParams();
    const [text, setText] = useState('');
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io.connect('http://localhost:5000');
        setSocket(newSocket);
        newSocket.emit('userConnected', { userId: id });
        return () => {
        
        newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket) {
    
        socket.on('userMessage', (data) => {
        
            setMessages((prevMessages) => [...prevMessages, data]);
        });
        }
    }, [socket]);
console.log(messages)
    const sendMessage = () => {
        axios.post(`http://localhost:5000/chat/${id}/sendMessage`, { text },{
            headers:{
                Authorization: `Bearer ${localStorage.getItem('token')}`}
        })
        .then((response) => {
        console.log('Message sent successfully:', response.data);

        setText('');
        })
        .catch((error) => {
        
        console.error('Failed to send message:', error);
        });


        socket.emit('sendMessage', { id, text });
        setText('');
    };

    return (
        <div>
        <h2>Chat with User ID: {id}</h2>
        <div className="chat-box">
            {messages.map((message, index) => (
            <div key={index} className="chat-message">
                <strong>{message.senderName}</strong>: {message.text}
            </div>
            ))}
        </div>
        <div>
            <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            />
            <button onClick={sendMessage}>Send</button>
        </div>
        </div>
    );
    };

    export default ChatPage;
