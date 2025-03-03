import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface HighScore {
  name: string;
  score: number;
  date: string;
}

interface ScoreData {
  scores: HighScore[];
  lastReset: string;
}

const SCORES_FILE = path.join(process.cwd(), 'data', 'scores.json');
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

async function ensureScoresFile() {
  try {
    await fs.access(path.dirname(SCORES_FILE));
  } catch {
    await fs.mkdir(path.dirname(SCORES_FILE), { recursive: true });
  }

  try {
    await fs.access(SCORES_FILE);
  } catch {
    await fs.writeFile(SCORES_FILE, JSON.stringify({
      scores: [],
      lastReset: new Date().toISOString()
    }));
  }
}

async function getScores(): Promise<ScoreData> {
  await ensureScoresFile();
  const data = await fs.readFile(SCORES_FILE, 'utf-8');
  return JSON.parse(data);
}

async function saveScores(data: ScoreData) {
  await ensureScoresFile();
  await fs.writeFile(SCORES_FILE, JSON.stringify(data, null, 2));
}

async function checkAndResetScores() {
  const data = await getScores();
  const lastReset = new Date(data.lastReset);
  const now = new Date();

  if (now.getTime() - lastReset.getTime() >= WEEK_IN_MS) {
    data.scores = [];
    data.lastReset = now.toISOString();
    await saveScores(data);
  }

  return data;
}

export async function GET() {
  try {
    const data = await checkAndResetScores();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting scores:', error);
    return NextResponse.json({ error: 'Fout bij ophalen scores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, score } = await request.json();

    if (!name || typeof score !== 'number') {
      return NextResponse.json(
        { error: 'Ongeldige score data' },
        { status: 400 }
      );
    }

    const data = await checkAndResetScores();

    const newScore: HighScore = {
      name,
      score,
      date: new Date().toLocaleDateString('nl-NL')
    };

    data.scores.push(newScore);
    data.scores.sort((a, b) => b.score - a.score);
    data.scores = data.scores.slice(0, 5); // Behoud alleen top 5

    await saveScores(data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json(
      { error: 'Fout bij opslaan score' },
      { status: 500 }
    );
  }
}