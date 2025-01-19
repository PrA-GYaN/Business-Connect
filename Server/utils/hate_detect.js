import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

export const hatecheck = async (req, res) => {
    const { title, content } = req.body;
    
    try {
        const result = await new Promise((resolve, reject) => {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = dirname(__filename);
            const pythonScriptPath = join(__dirname, '..', '..', 'Algorithm', 'instant_hateDetect.py');
            
            // Spawn Python process with title and content as arguments
            const pythonProcess = spawn('python', [
                pythonScriptPath,
                title,
                content,
            ]);

            let output = '';
            let errorOutput = '';

            // Capture the Python script's stdout (standard output)
            pythonProcess.stdout.on('data', (data) => {
                output += data.toString(); // Append output to result
            });

            // Capture any error messages from the Python script
            pythonProcess.stderr.on('data', (data) => {
                errorOutput += data.toString(); // Capture error data
            });

            // Handle Python process closure
            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(output.trim());
                } else {
                    console.error(`Python process exited with code ${code}`);
                    console.error("Error Output:", errorOutput);  // Log error output
                    reject(new Error(`Python process exited with code ${code}`));
                }
            });
        });

        // Log the result of the Python script to the Node.js console
        console.log('Python script output:', result);

        // Send the prediction result back as JSON in the HTTP response
        res.status(200).json({ prediction: result });
    } catch (error) {
        // Log and handle any errors encountered during the process
        console.error('Error running Python script:', error);
        res.status(500).json({ error: error.message });
    }
};