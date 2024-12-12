import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from "../models/user.model.js";

export const runRecommend = async (req, res) => {
    // console.log("Requesting Recommendations for User");

    // const { user_interests, user_skills } = req.body;
    const user_interests = "['Music', 'Entrepreneurship', 'Leadership', 'Marketing Trends']";
    const  user_skills = "['Marketing', 'SEO', 'UX/UI Design', 'Networking']";
    const current = String('s');

    try {
        const result = await new Promise((resolve, reject) => {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = dirname(__filename);
            const pythonScriptPath = join(__dirname, '..', '..', 'Algorithm', 'recommend.py');

            // Ensure correct arguments are passed as JSON strings
            const pythonProcess = spawn('python', [
                pythonScriptPath,
                JSON.stringify(user_interests),
                JSON.stringify(user_skills),
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


        let users_list = [];
        for (let userId of result) {
            if(userId != current) {
                const user = await User.findById(userId);
                if (user) {
                    users_list.push(user);
                }
            }
        }
        res.status(200).json(users_list);

    } catch (error) {
        console.error('Error running Python script:', error);
        res.status(500).json({ error: error.message });
    }
};

runRecommend();