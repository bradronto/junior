import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import axios from 'axios';

// ⬇️ CHANGE THIS to your Netlify site URL after deploying
const API_URL = 'https://junior-juror.netlify.app/.netlify/functions/chat';

type Message = { role: 'user' | 'ai' | 'error'; content: string };

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const res = await axios.post(API_URL, { message: text }, { timeout: 120000 });
      setMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
    } catch (err: any) {
      const detail = err?.response?.data?.details || err?.response?.data?.error || err.message;
      setMessages(prev => [...prev, { role: 'error', content: `Error: ${detail}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 Junior AI</Text>
        <Text style={styles.headerSub}>Ollama via Netlify</Text>
      </View>

      {/* Messages */}
      <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesContent}>
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🤖</Text>
            <Text style={styles.emptyText}>Ask me anything!</Text>
            <Text style={styles.emptyHint}>Powered by Ollama running on your Mac</Text>
          </View>
        )}
        {messages.map((msg, i) => (
          <View key={i} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : msg.role === 'ai' ? styles.aiBubble : styles.errorBubble]}>
            <Text style={[styles.bubbleText, msg.role === 'user' && styles.userText]}>{msg.content}</Text>
          </View>
        ))}
        {loading && (
          <View style={[styles.bubble, styles.aiBubble]}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.thinkingText}> Thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
          editable={!loading}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]} onPress={sendMessage} disabled={!input.trim() || loading}>
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  header: { backgroundColor: '#007AFF', paddingTop: 55, paddingBottom: 15, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  messages: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 8 },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 20, fontWeight: '600', color: '#333' },
  emptyHint: { fontSize: 14, color: '#888', marginTop: 8 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 18, marginBottom: 8 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center' },
  errorBubble: { alignSelf: 'flex-start', backgroundColor: '#ffe0e0' },
  bubbleText: { fontSize: 16, color: '#222', lineHeight: 22 },
  userText: { color: '#fff' },
  thinkingText: { fontSize: 14, color: '#888', fontStyle: 'italic' },
  inputRow: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd', alignItems: 'flex-end' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, maxHeight: 100, marginRight: 8 },
  sendBtn: { backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20 },
  sendBtnDisabled: { backgroundColor: '#aaa' },
  sendBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
