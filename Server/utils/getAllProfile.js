import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

export const getAllProfiles = async (req, res) => {
    console.log("Updating data...");
    try {
        const result = await new Promise((resolve, reject) => {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = dirname(__filename);
            const pythonScriptPath = join(__dirname, '..', '..', 'Algorithm', 'connectDb.py');
            const pythonProcess = spawn('python', [pythonScriptPath]);

            let output = '';
            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    console.log("Output:", output.trim());
                    resolve(output.trim());
                } else {
                    reject(new Error(`Python process exited with code ${code}`));
                }
            });
        });

        console.log("Result:", result);
        // res.status(200).json({ message: 'Data updated successfully' });
    } catch (error) {
        console.error('Error running Python script:', error);
        // res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllProfilesAPI = async (req, res) => {
    console.log("Updating data...");
    try {
        const result = await new Promise((resolve, reject) => {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = dirname(__filename);
            const pythonScriptPath = join(__dirname, '..', '..', 'Algorithm', 'connectDb.py');
            const pythonProcess = spawn('python', [pythonScriptPath]);

            let output = '';
            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    console.log("Output:", output.trim());
                    resolve(output.trim());
                } else {
                    reject(new Error(`Python process exited with code ${code}`));
                }
            });
        });

        console.log("Result:", result);
        res.status(200).json({ message: 'Data updated successfully' });
    } catch (error) {
        console.error('Error running Python script:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};