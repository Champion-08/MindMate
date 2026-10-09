import os
import json

base_dir = r"C:\Users\DELL\.gemini\antigravity\scratch\mindmate\src"

def replace_in_file(path, search, replace):
    full_path = os.path.join(base_dir, path)
    if os.path.exists(full_path):
        with open(full_path, "r", encoding="utf-8") as f:
            content = f.read()
        content = content.replace(search, replace)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)

# Fix Home.tsx
replace_in_file("pages/Home.tsx",
                "const [topicsData, twinData, plannerData] = await Promise.all([",
                "const [topicsRes, twinRes, plannerRes] = await Promise.all([")
replace_in_file("pages/Home.tsx",
                "if (topicsData && topicsData.length > 0) {",
                "const topicsData = topicsRes?.data?.topics;\n        const twinData = twinRes?.data;\n        const plannerData = plannerRes?.data?.tasks || plannerRes?.data;\n        if (topicsData && topicsData.length > 0) {")
replace_in_file("pages/Home.tsx",
                "const sorted = [...topicsData].sort((a: any, b: any) => a.mastery - b.mastery);",
                "const sorted = [...topicsData].sort((a: any, b: any) => a.mastery - b.mastery);")

# Fix Learn.tsx
replace_in_file("pages/Learn.tsx", 
                "setMessages(history.slice(-10));", 
                "setMessages(history.data.messages.slice(-10));")
replace_in_file("pages/Learn.tsx", 
                "setMessages((prev) => [...prev, response]);", 
                "setMessages((prev) => [...prev, response.data.botMessage as any]);")

# Fix Progress.tsx
replace_in_file("pages/Progress.tsx",
                "setTopics(data);",
                "setTopics(data.data.topics);")
replace_in_file("pages/Progress.tsx",
                "setTopics(mockTopics);",
                "setTopics(mockTopics);")

# Fix LearningTwin.tsx
replace_in_file("pages/LearningTwin.tsx",
                "setLearner(data);",
                "setLearner(data.data);")
replace_in_file("pages/LearningTwin.tsx",
                "setLearningStyle(data.learningStyle);",
                "setLearningStyle(data.data.learningStyle);")
replace_in_file("pages/LearningTwin.tsx",
                "setPreferredSession(data.preferredSession);",
                "setPreferredSession(data.data.preferredSession);")

# Fix Quiz.tsx
replace_in_file("pages/Quiz.tsx",
                "setSessionId(id);",
                "setSessionId(id.data.sessionId);")

# Fix Planner.tsx
replace_in_file("pages/Planner.tsx",
                "setPlannerDays(data);",
                "setPlannerDays(data.data.tasks || data.data as any);")

# Fix Materials.tsx
replace_in_file("pages/Materials.tsx",
                "setMaterials(data);",
                "setMaterials(data.data.materials);")
replace_in_file("pages/Materials.tsx",
                "setMaterialDetails(details);",
                "setMaterialDetails(details.data.material);")
replace_in_file("pages/Materials.tsx",
                "apiDeleteMaterial(selectedMaterial.id)",
                "apiDeleteMaterial(selectedMaterial.id.toString())")
replace_in_file("pages/Materials.tsx",
                "handleDelete(id: number)",
                "handleDelete(id: string | number)")
replace_in_file("pages/Materials.tsx",
                "onClick={() => selectedMaterial && handleDelete(selectedMaterial.id)}",
                "onClick={() => selectedMaterial && handleDelete(selectedMaterial.id.toString())}")

# Fix Insights.tsx
replace_in_file("pages/Insights.tsx",
                "const data = await apiGetInsights();\n        setInsights(data.length > 0 ? data : mockInsights);",
                "const res = await apiGetInsights();\n        setInsights(res.data.insights.length > 0 ? res.data.insights : mockInsights);")

# Fix Practice.tsx
replace_in_file("pages/Practice.tsx",
                "const data = await apiGetQuizHistory();\n        if (data && data.length > 0) {",
                "const res = await apiGetQuizHistory();\n        const data = res.data.sessions;\n        if (data && data.length > 0) {")
