import { useState, useEffect, useRef } from 'react';
import { create, insert, search, remove } from '@orama/orama';
import type { ChatMessage } from '../types';

interface OramaDatabase {
  search: (params: any) => Promise<any>;
  insert: (document: any) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useOramaSearch = () => {
  const [db, setDb] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const dbRef = useRef<any>(null);

  useEffect(() => {
    const initOrama = async () => {
      try {
        const database = await create({
          schema: {
            id: 'string',
            message: 'string',
            sender: 'string',
            timestamp: 'number',
            metadata: 'string'
          }
        });
        
        dbRef.current = database;
        setDb(database);
        setIsReady(true);
      } catch (error) {
        console.error('Error initializing Orama:', error);
      }
    };

    initOrama();
  }, []);

  const indexMessage = async (message: ChatMessage) => {
    if (!dbRef.current) return;

    try {
      await insert(dbRef.current, {
        id: message.id,
        message: message.message,
        sender: message.sender,
        timestamp: message.timestamp.getTime(),
        metadata: JSON.stringify(message.metadata || {})
      });
    } catch (error) {
      console.error('Error indexing message:', error);
    }
  };

  const searchMessages = async (query: string) => {
    if (!dbRef.current || !query.trim()) return [];

    try {
      const results = await search(dbRef.current, {
        term: query,
        properties: ['message', 'sender'],
        limit: 20,
        tolerance: 1
      });

      return results.hits.map((hit: any) => ({
        id: hit.document.id,
        message: hit.document.message,
        sender: hit.document.sender,
        timestamp: new Date(hit.document.timestamp),
        score: hit.score,
        metadata: JSON.parse(hit.document.metadata || '{}')
      }));
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  };

  const removeMessage = async (messageId: string) => {
    if (!dbRef.current) return;

    try {
      await remove(dbRef.current, messageId);
    } catch (error) {
      console.error('Error removing message:', error);
    }
  };

  const indexMultipleMessages = async (messages: ChatMessage[]) => {
    if (!dbRef.current) return;

    for (const message of messages) {
      await indexMessage(message);
    }
  };

  return {
    isReady,
    indexMessage,
    searchMessages,
    removeMessage,
    indexMultipleMessages
  };
};

