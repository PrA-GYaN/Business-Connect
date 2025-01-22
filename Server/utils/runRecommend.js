import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from "../models/user.model.js";
import fs from 'fs';
import mongoose from 'mongoose';

export const runRecommend = async (req, res) => {
    // const { user_interests, user_skills, liked_profiles } = req.body;
    const user_interests = "['Music', 'Entrepreneurship', 'Leadership', 'Marketing Trends']";
    const user_skills = "['Marketing', 'SEO', 'UX/UI Design', 'Networking']";
    const liked_profiles = ['6789c4d95460a8925b9e0a0a', '6789ca15853b6dda48033d61'];

    // Validate input (optional but recommended)
    if (!user_interests || !user_skills) {
        return res.status(400).json({ error: 'User interests and skills are required' });
    }

    try {

        const result = await new Promise((resolve, reject) => {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = dirname(__filename);
            const pythonScriptPath = join(__dirname, '..', '..', 'Algorithm', 'recommend.py');
            
            if (!fs.existsSync(pythonScriptPath)) {
                return reject(new Error('Python script not found'));
            }

            const pythonProcess = spawn('python', [
                pythonScriptPath,
                JSON.stringify(user_interests),
                JSON.stringify(user_skills),
                JSON.stringify(liked_profiles),
            ]);

            let output = '';
            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        console.log(output);
                        const parsedOutput = JSON.parse(output.trim());
                        resolve(parsedOutput);
                    } catch (e) {
                        reject(new Error('Error parsing Python output as JSON: ' + e.message));
                    }
                } else {
                    reject(new Error(`Python process exited with code ${code}`));
                }
            });
        });

        console.log('Recommended user IDs:', result);
        
        // Check if result is valid
        if (!Array.isArray(result) || result.length === 0) {
            return res.status(404).json({ error: 'No recommendations found' });
        }

        const userIds = result.map(id => new mongoose.Types.ObjectId(id));
        console.log('Mapped user IDs:', userIds);

        // Query with timeout adjustment
        const usersList = await User.find({ _id: { $in: userIds } })
            .maxTimeMS(15000) // Increase query timeout
            .exec();

        console.log('Recommended user list:', usersList);
        res.status(200).json(usersList);

    } catch (error) {
        console.error('Error running Python script:', error);
        res.status(500).json({ error: error.message });
    }
};