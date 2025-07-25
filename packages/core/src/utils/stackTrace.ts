import { StackFrame } from '../types/payload';

export function parseStackTrace(stack: string): StackFrame[] {
  if (!stack) return [];
  
  const lines = stack.split('\n');
  const frames: StackFrame[] = [];
  
  for (const line of lines) {
    const frame = parseStackLine(line);
    if (frame) {
      frames.push(frame);
    }
  }
  
  return frames;
}

function parseStackLine(line: string): StackFrame | null {
  line = line.trim();
  
  // Chrome/V8 format: "at functionName (file:line:column)"
  const chromeMatch = line.match(/^\s*at\s+(.*?)\s+\((.*?):(\d+):(\d+)\)$/);
  if (chromeMatch) {
    return {
      function: chromeMatch[1],
      file: chromeMatch[2],
      line: chromeMatch[3] ? parseInt(chromeMatch[3], 10) : undefined,
      column: chromeMatch[4] ? parseInt(chromeMatch[4], 10) : undefined
    };
  }
  
  // Chrome/V8 format: "at file:line:column"
  const chrome2Match = line.match(/^\s*at\s+(.*?):(\d+):(\d+)$/);
  if (chrome2Match) {
    return {
      file: chrome2Match[1],
      line: chrome2Match[2] ? parseInt(chrome2Match[2], 10) : undefined,
      column: chrome2Match[3] ? parseInt(chrome2Match[3], 10) : undefined
    };
  }
  
  // Firefox format: "functionName@file:line:column"
  const firefoxMatch = line.match(/^(.*)@(.*?):(\d+):(\d+)$/);
  if (firefoxMatch) {
    return {
      function: firefoxMatch[1] || undefined,
      file: firefoxMatch[2],
      line: firefoxMatch[3] ? parseInt(firefoxMatch[3], 10) : undefined,
      column: firefoxMatch[4] ? parseInt(firefoxMatch[4], 10) : undefined
    };
  }
  
  return null;
}