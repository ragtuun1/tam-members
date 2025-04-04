import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  data: any[] = [];
  searchQuery: string = '';
  totalAdultGuests: number = 0;
  totalKidsGuests: number = 0;
  totalGuests: number = 0;

  isModalOpen: boolean = false;
  newRecord: any = {};

  filePath: string = 'assets/MembershipData.xlsx';
  sponsorsfilePath: string = 'assets/SponsorData.xlsx';

  constructor(private http: HttpClient) {}

  loadData() {
    // Use HttpClient to load the Excel file as an arraybuffer
    this.http.get(this.filePath, { responseType: 'arraybuffer' }).subscribe(
      (response: ArrayBuffer) => {
        console.log('File loaded successfully');

        // Read the file with XLSX library
        try {
          const workbook = XLSX.read(new Uint8Array(response), {
            type: 'array',
          });
          console.log('Workbook:', workbook); // Log the entire workbook object to inspect its structure

          const sheetName = workbook.SheetNames[0]; // Get the first sheet name
          console.log('Sheet name:', sheetName);

          const sheet = workbook.Sheets[sheetName]; // Get the actual sheet
          console.log('Sheet data:', sheet); // Log the sheet content

          // Convert the sheet data to JSON
          this.data = XLSX.utils.sheet_to_json(sheet, { defval: '' }); // Convert sheet to JSON
          console.log('Data:', this.data); // Log the parsed data

          // Calculate the total guests (Adults + Kids count)
          this.calculateTotal();
        } catch (err) {
          console.error('Error reading the Excel file:', err);
        }
      },
      (error: any) => {
        console.error('Error loading file:', error); // Log any error in file loading
      }
    );
  }

  loadSponsorsData() {
    // Use HttpClient to load the Excel file as an arraybuffer
    this.http
      .get(this.sponsorsfilePath, { responseType: 'arraybuffer' })
      .subscribe(
        (response: ArrayBuffer) => {
          console.log('File loaded successfully');

          // Read the file with XLSX library
          try {
            const workbook = XLSX.read(new Uint8Array(response), {
              type: 'array',
            });
            console.log('Workbook:', workbook); // Log the entire workbook object to inspect its structure

            const sheetName = workbook.SheetNames[0]; // Get the first sheet name
            console.log('Sheet name:', sheetName);

            const sheet = workbook.Sheets[sheetName]; // Get the actual sheet
            console.log('Sheet data:', sheet); // Log the sheet content

            // Convert the sheet data to JSON
            this.data = XLSX.utils.sheet_to_json(sheet, { defval: '' }); // Convert sheet to JSON
            console.log('Data:', this.data); // Log the parsed data

            // Calculate the total guests (Adults + Kids count)
            this.calculateTotal();
          } catch (err) {
            console.error('Error reading the Excel file:', err);
          }
        },
        (error: any) => {
          console.error('Error loading file:', error); // Log any error in file loading
        }
      );
  }

  saveData() {
    const worksheet = XLSX.utils.json_to_sheet(this.data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'MembershipData.xlsx';
    //a.click();
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const arrayBuffer = e.target.result;
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
          type: 'array',
        });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        this.data = XLSX.utils.sheet_to_json(sheet);
      };
      reader.readAsArrayBuffer(file);
    }
  }

  updateRecord(record: any, field: string, value: any): void {
    if (field === 'CheckedIn') {
      record[field] = value.target.checked;
    } else {
      record[field] = Number(value);
    }
    this.calculateTotal();
    this.saveData();
  }

  calculateTotal(): void {
    this.totalAdultGuests = this.data.reduce(
      (sum, record) => sum + parseInt(record.Adults || '0', 10),
      0
    );
    this.totalKidsGuests = this.data.reduce(
      (sum, record) => sum + parseInt(record.Kids || '0', 10),
      0
    );

    this.totalGuests = this.totalAdultGuests + this.totalKidsGuests;
  }

  openModal(): void {
    this.isModalOpen = true;
    this.newRecord = {
      'Last Name': '',
      'First Name': '',
      'Email Address': '',
      'Phone no': '',
      'Membership Level': '',
      'Payment Mode': '',
      CheckedIn: false,
      Adults: 1,
      Kids: 1,
    };
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  addNewRecord(): void {
    this.data.push(this.newRecord);
    this.isModalOpen = false;
    this.calculateTotal();
  }

  exportToExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(this.data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'TAM_Membership.xlsx');
  }

  get filteredData() {
    return this.data.filter(
      (record) =>
        record['Last Name']
          ?.toLowerCase()
          .includes(this.searchQuery.toLowerCase()) ||
        record['First Name']
          ?.toLowerCase()
          .includes(this.searchQuery.toLowerCase()) ||
        record['Email Address']
          ?.toLowerCase()
          .includes(this.searchQuery.toLowerCase()) ||
        record['Phone Number']?.includes(this.searchQuery)
    );
  }
}
