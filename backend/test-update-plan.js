// Native fetch in Node 20

async function testUpdate() {
    // 1. Login to get token
    const loginRes = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@example.com', password: 'admin' }) // Assuming admin exists
    });
    const loginData = await loginRes.json();
    
    if (!loginData.token) {
        console.error("Login failed (or no admin user yet?):", loginData);
        // Fallback: If no admin user, this test might fail. 
        // But the user IS logged in as admin in the screenshot.
        return;
    }

    const token = loginData.token;
    console.log("Got Token:", token ? "Yes" : "No");

    // 2. Fetch Plans
    const plansRes = await fetch('http://localhost:3000/api/admin/plans', {
         headers: { 'Authorization': `Bearer ${token}` }
    });
    const plans = await plansRes.json();
    console.log("Plans found:", plans.length);
    
    if (plans.length === 0) {
        console.log("No plans to update.");
        return;
    }

    const planToUpdate = plans[0];
    console.log("Attempting to update Plan:", planToUpdate.name);

    // 3. Update Plan
    const updateRes = await fetch(`http://localhost:3000/api/admin/plans/${planToUpdate.id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: planToUpdate.name, // Keep name
            price: planToUpdate.price,
            type: planToUpdate.type,
            credits: planToUpdate.credits,
            is_active: 1
        })
    });

    try {
        const result = await updateRes.json();
        console.log("Update status:", updateRes.status);
        console.log("Update result:", result);
    } catch (e) {
        console.error("Update failed JSON parse:", e);
        console.log("Raw text:", await updateRes.text());
    }
}

testUpdate();
