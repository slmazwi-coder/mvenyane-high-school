import jsPDF from 'jspdf';
import type { Application } from './storage';

export function generateApplicationPDF(app: Application): void {
  const doc = new jsPDF();
  const green = [0, 100, 0];
  
  // Header
  doc.setFillColor(green[0], green[1], green[2]);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('[SCHOOL NAME]', 105, 18, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Student Application Form', 105, 30, { align: 'center' });

  // Reset text color
  doc.setTextColor(0, 0, 0);
  let y = 55;

  const addField = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(label + ':', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value || 'N/A', 80, y);
    y += 10;
  };

  // Student Details
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(green[0], green[1], green[2]);
  doc.text('Student Details', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 10;

  addField('First Name', app.firstName);
  addField('Last Name', app.lastName);
  addField('Date of Birth', app.dob);
  addField('Grade Applied', app.grade);
  addField('Previous School', app.previousSchool);

  y += 5;

  // Guardian Details
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(green[0], green[1], green[2]);
  doc.text('Guardian Details', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 10;

  addField('Guardian Name', app.guardianName);
  addField('Phone', app.guardianPhone);
  addField('Email', app.guardianEmail);
  addField('Address', app.address);

  y += 5;

  // Application Status
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(green[0], green[1], green[2]);
  doc.text('Application Status', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 10;

  addField('Status', app.status);
  addField('Submitted', app.submittedDate);

  // Footer
  doc.setFillColor(green[0], green[1], green[2]);
  doc.rect(0, 280, 210, 17, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('"[SCHOOL MOTTO]"', 105, 290, { align: 'center' });

  doc.save(`application_${app.firstName}_${app.lastName}.pdf`);
}
