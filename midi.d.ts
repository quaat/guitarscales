interface MIDIPort {
  id: string;
  manufacturer?: string | null;
  name?: string | null;
  state?: 'connected' | 'disconnected';
  connection?: 'open' | 'closed' | 'pending';
}

interface MIDIOutput extends MIDIPort {
  send(data: number[] | Uint8Array, timestamp?: number): void;
}

interface MIDIAccess extends EventTarget {
  outputs: Map<string, MIDIOutput>;
  onstatechange: ((event: Event) => void) | null;
}

interface Navigator {
  requestMIDIAccess?: (options?: { sysex?: boolean }) => Promise<MIDIAccess>;
}
