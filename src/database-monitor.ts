import dotenv from 'dotenv';
import sql from 'mssql';

dotenv.config();

interface DatabaseConfig {
  server: string;
  database: string;
  user: string;
  password: string;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
  };
}

class DatabaseMonitor {
  private config: DatabaseConfig;
  private previousSnapshot: any[] = [];
  private isRunning: boolean = false;

  constructor() {
    this.config = {
      server: process.env.DB_SERVER!,
      database: process.env.DB_DATABASE!,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    };
  }

  private async getCurrentSnapshot(): Promise<any[]> {
    try {
      const pool = await sql.connect(this.config);
      const result = await pool.request().query('SELECT * FROM YourTableName');
      await pool.close();
      return result.recordset;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  }

  private findChanges(previous: any[], current: any[]): {
    added: any[];
    modified: any[];
    removed: any[];
  } {
    const added = current.filter(
      (curr) => !previous.some((prev) => prev.id === curr.id)
    );
    const removed = previous.filter(
      (prev) => !current.some((curr) => curr.id === prev.id)
    );
    const modified = current.filter((curr) => {
      const prev = previous.find((p) => p.id === curr.id);
      return prev && JSON.stringify(prev) !== JSON.stringify(curr);
    });

    return { added, modified, removed };
  }

  private async processChanges(changes: {
    added: any[];
    modified: any[];
    removed: any[];
  }) {
    if (changes.added.length > 0) {
      console.log('New records:', changes.added);
    }
    if (changes.modified.length > 0) {
      console.log('Modified records:', changes.modified);
    }
    if (changes.removed.length > 0) {
      console.log('Removed records:', changes.removed);
    }
  }

  public async startMonitoring(intervalMs: number = 5000) {
    if (this.isRunning) {
      console.log('Monitor is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting database monitoring...');

    const monitor = async () => {
      try {
        const currentSnapshot = await this.getCurrentSnapshot();
        
        if (this.previousSnapshot.length > 0) {
          const changes = this.findChanges(this.previousSnapshot, currentSnapshot);
          await this.processChanges(changes);
        }

        this.previousSnapshot = currentSnapshot;
      } catch (error) {
        console.error('Error in monitoring cycle:', error);
      }

      if (this.isRunning) {
        setTimeout(monitor, intervalMs);
      }
    };

    await monitor();
  }

  public stopMonitoring() {
    this.isRunning = false;
    console.log('Stopping database monitoring...');
  }
}

// Usage example
const monitor = new DatabaseMonitor();
monitor.startMonitoring().catch(console.error);

// Handle graceful shutdown
process.on('SIGINT', () => {
  monitor.stopMonitoring();
  process.exit(0);
}); 