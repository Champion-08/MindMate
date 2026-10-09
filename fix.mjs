import fs from 'fs';
import path from 'path';

const base_dir = "C:\\Users\\DELL\\.gemini\\antigravity\\scratch\\mindmate\\src";

function replace_in_file(filePath, search, replace) {
    const fullPath = path.join(base_dir, filePath);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, "utf-8");
        content = content.split(search).join(replace);
        fs.writeFileSync(fullPath, content, "utf-8");
    }
}

// Fix Home.tsx
replace_in_file("pages/Home.tsx",
                "const [topicsData, twinData, plannerData] = await Promise.all([",
                "const [topicsRes, twinRes, plannerRes] = await Promise.all([");
replace_in_file("pages/Home.tsx",
                "if (topicsData && topicsData.length > 0) {",
                "const topicsData = topicsRes?.data?.topics;\\n        const twinData = twinRes?.data;\\n        const plannerData = plannerRes?.data?.tasks || plannerRes?.data;\\n        if (topicsData && topicsData.length > 0) {");

// Fix Learn.tsx
replace_in_file("pages/Learn.tsx", 
                "setMessages(history.slice(-10));", 
                "setMessages(history.data.messages.slice(-10));");
replace_in_file("pages/Learn.tsx", 
                "setMessages((prev) => [...prev, response]);", 
                "setMessages((prev) => [...prev, response.data.botMessage as any]);");

// Fix Progress.tsx
replace_in_file("pages/Progress.tsx",
                "setTopics(data);",
                "setTopics(data.data.topics);");

// Fix LearningTwin.tsx
replace_in_file("pages/LearningTwin.tsx",
                "setLearner(data);",
                "setLearner(data.data);");
replace_in_file("pages/LearningTwin.tsx",
                "setLearningStyle(data.learningStyle);",
                "setLearningStyle(data.data.learningStyle);");
replace_in_file("pages/LearningTwin.tsx",
                "setPreferredSession(data.preferredSession);",
                "setPreferredSession(data.data.preferredSession);");

// Fix Quiz.tsx
replace_in_file("pages/Quiz.tsx",
                "setSessionId(id);",
                "setSessionId(id.data.sessionId);");

// Fix Planner.tsx
replace_in_file("pages/Planner.tsx",
                "setPlannerDays(data);",
                "setPlannerDays(data.data.tasks || data.data as any);");

// Fix Materials.tsx
replace_in_file("pages/Materials.tsx",
                "setMaterials(data);",
                "setMaterials(data.data.materials);");
replace_in_file("pages/Materials.tsx",
                "setMaterialDetails(details);",
                "setMaterialDetails(details.data.material);");
replace_in_file("pages/Materials.tsx",
                "apiDeleteMaterial(selectedMaterial.id)",
                "apiDeleteMaterial(selectedMaterial.id.toString())");
replace_in_file("pages/Materials.tsx",
                "handleDelete(id: number)",
                "handleDelete(id: string | number)");

// Fix Insights.tsx
replace_in_file("pages/Insights.tsx",
                "const data = await apiGetInsights();\\n        setInsights(data.length > 0 ? data : mockInsights);",
                "const res = await apiGetInsights();\\n        setInsights(res.data.insights.length > 0 ? res.data.insights : mockInsights);");

// Fix Practice.tsx
replace_in_file("pages/Practice.tsx",
                "const data = await apiGetQuizHistory();\\n        if (data && data.length > 0) {",
                "const res = await apiGetQuizHistory();\\n        const data = res.data.sessions;\\n        if (data && data.length > 0) {");

console.log("Fixes applied");
