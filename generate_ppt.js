const pptxgen = require('pptxgenjs');

let pptx = new pptxgen();

pptx.author = 'Intern';
pptx.company = 'Company';
pptx.revision = '1';
pptx.subject = 'Internship Project Presentation';
pptx.title = 'Vastra Kuteer Presentation';

// Slide 1: Title Slide
let slide1 = pptx.addSlide();
slide1.addText('Vastra Kuteer: Premium Indian Ethnic Wear Platform', { x: 1, y: 1.5, w: '80%', fontSize: 32, bold: true, align: 'center', color: '363636' });
slide1.addText('Final Internship Project Presentation', { x: 1, y: 2.5, w: '80%', fontSize: 24, align: 'center', color: '666666' });
slide1.addText('Student Name: [Your Name]\nRoll Number: [Your Roll Number]\nCompany: [Company Name]\nRole: Full Stack Developer Intern', { x: 1, y: 3.5, w: '80%', fontSize: 18, align: 'center', color: '363636' });

// Slide 2: About the Internship
let slide2 = pptx.addSlide();
slide2.addText('Internship Overview', { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: '363636' });
slide2.addText([
    { text: 'Company Name: ', options: { bold: true } }, { text: '[Company Name]\n' },
    { text: 'Duration: ', options: { bold: true } }, { text: '[e.g., 3 Months / 6 Months]\n' },
    { text: 'Role & Focus Area: ', options: { bold: true } }, { text: 'Full-stack web development using the MERN stack.\n' },
    { text: 'Primary Objective: ', options: { bold: true } }, { text: 'To develop, secure, and deploy a production-ready E-Commerce platform handling live payments and automated marketing.' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 18, color: '363636', bullet: true });

// Slide 3: Problem Statement
let slide3 = pptx.addSlide();
slide3.addText('Objective & Problem Statement', { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: '363636' });
slide3.addText([
    { text: 'The Need: ', options: { bold: true } }, { text: 'Traditional ethnic wear stores lack a premium, dedicated online presence with seamless user experience.\n' },
    { text: 'The Solution: ', options: { bold: true } }, { text: 'Develop "Vastra Kuteer" — a specialized e-commerce platform offering a modern UI, robust admin controls, and secure payment processing.\n' },
    { text: 'Goal: ', options: { bold: true } }, { text: 'To create an end-to-end scalable application handling everything from user registration to order fulfillment and automated customer engagement.' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 18, color: '363636', bullet: true });

// Slide 4: Introduction
let slide4 = pptx.addSlide();
slide4.addText('Project Overview: Vastra Kuteer', { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: '363636' });
slide4.addText([
    { text: 'A full-stack E-Commerce application for Indian ethnic wear.\n' },
    { text: 'User Side: ', options: { bold: true } }, { text: 'Product browsing, cart management, Google OAuth login, and secure checkout.\n' },
    { text: 'Admin Side: ', options: { bold: true } }, { text: 'Complete inventory management (CRUD), interactive analytics dashboards, and role-based access.' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 18, color: '363636', bullet: true });

// Slide 5: My Role & Responsibilities
let slide5 = pptx.addSlide();
slide5.addText('My Contributions', { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: '363636' });
slide5.addText([
    { text: 'Frontend Development: ', options: { bold: true } }, { text: 'Designed and built responsive UI components using React, Vite, and Tailwind CSS.\n' },
    { text: 'Backend Architecture: ', options: { bold: true } }, { text: 'Developed RESTful APIs, authentication middleware (JWT), and database models using Node.js and Express.\n' },
    { text: 'Payment Integration: ', options: { bold: true } }, { text: 'Successfully integrated the Razorpay payment gateway for live transactions.\n' },
    { text: 'Automation: ', options: { bold: true } }, { text: 'Built an automated marketing engine using node-cron and nodemailer for scheduled promotional emails.\n' },
    { text: 'Deployment: ', options: { bold: true } }, { text: 'Handled live production deployment (frontend on Render, custom domain configuration).' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 18, color: '363636', bullet: true });

// Slide 6: Tech Stack
let slide6 = pptx.addSlide();
slide6.addText('Technologies & Tools', { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: '363636' });
let tableData = [
    [{ text: 'Layer', options: { bold: true } }, { text: 'Technologies Used', options: { bold: true } }],
    ['Frontend', 'React, Vite, Tailwind CSS, Recharts'],
    ['Backend', 'Node.js, Express.js'],
    ['Database', 'MongoDB & Mongoose'],
    ['Third-Party Services', 'Razorpay, Cloudinary, Nodemailer, Google OAuth']
];
slide6.addTable(tableData, { x: 0.5, y: 1.5, w: '90%', colW: [3, 6], border: { type: 'solid', color: 'CCCCCC' }, fill: 'F7F7F7', fontSize: 18, align: 'left', valign: 'middle' });

// Slide 7: Architecture
let slide7 = pptx.addSlide();
slide7.addText('High-Level Architecture', { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: '363636' });
slide7.addText([
    { text: 'Client-Side: ', options: { bold: true } }, { text: 'React SPA (Single Page Application) communicating via Axios.\n' },
    { text: 'Server-Side: ', options: { bold: true } }, { text: 'Express.js routing, authentication middleware, and business logic.\n' },
    { text: 'Data Management: ', options: { bold: true } }, { text: 'MongoDB Atlas for scalable, document-based storage; Cloudinary for automated image resizing and hosting.' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 18, color: '363636', bullet: true });

// Slide 8: Key Features
let slide8 = pptx.addSlide();
slide8.addText('Core Features Highlight', { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: '363636' });
slide8.addText([
    { text: 'Secure Authentication: ', options: { bold: true } }, { text: 'JWT-based login, password hashing (Bcrypt), and Google Social Login.\n' },
    { text: 'E-Commerce Core: ', options: { bold: true } }, { text: 'Shopping cart, order tracking, and dynamic product filtering.\n' },
    { text: 'Admin Dashboard: ', options: { bold: true } }, { text: 'Real-time analytics, order management, and product CRUD operations.\n' },
    { text: 'Automated Event Marketing: ', options: { bold: true } }, { text: 'System automatically triggers promotional emails 24 hours before major sales events.' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 18, color: '363636', bullet: true });

// Slide 9: Challenges
let slide9 = pptx.addSlide();
slide9.addText('Challenges & How I Solved Them', { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: '363636' });
slide9.addText([
    { text: 'Challenge 1: Handling secure, real-time payment verifications.\n', options: { bold: true } },
    { text: 'Solution: Implemented Razorpay webhooks and server-side signature validation to prevent fraud.\n' },
    { text: 'Challenge 2: Managing scheduled email marketing without server overload.\n', options: { bold: true } },
    { text: 'Solution: Used node-cron for scheduling and offloaded email processing to a background utility script.\n' },
    { text: 'Challenge 3: Live deployment and custom domain routing.\n', options: { bold: true } },
    { text: 'Solution: Configured DNS records and SSL certificates to successfully map the Render app to the custom .in domain.' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 18, color: '363636', bullet: true });

// Slide 10: Conclusion
let slide10 = pptx.addSlide();
slide10.addText('Internship Learnings & Conclusion', { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: '363636' });
slide10.addText([
    { text: 'Gained hands-on experience in building a production-ready MERN application.\n' },
    { text: 'Learned how to integrate and secure third-party APIs (Payment, Email, Cloud Storage).\n' },
    { text: 'Understood the software development lifecycle from local setup to live deployment.\n' },
    { text: 'Conclusion: ', options: { bold: true } }, { text: 'Vastra Kuteer successfully demonstrates a scalable approach to modern e-commerce web development.' }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 18, color: '363636', bullet: true });

// Slide 11: Q&A
let slide11 = pptx.addSlide();
slide11.addText('Thank You!', { x: 1, y: 2, w: '80%', fontSize: 40, bold: true, align: 'center', color: '363636' });
slide11.addText('Open for Questions.', { x: 1, y: 3, w: '80%', fontSize: 24, align: 'center', color: '666666' });

// Save PPT
pptx.writeFile({ fileName: 'Vastra_Kuteer_Internship_Presentation.pptx' }).then(fileName => {
    console.log('created file: ' + fileName);
});
