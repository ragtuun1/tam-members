import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  data: any[] = [];
  searchQuery: string = '';
  totalGuests: number = 0;

  isModalOpen: boolean = false;
  newRecord: any = {};

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
  }

  calculateTotal(): void {
    this.totalGuests = this.data.reduce(
      (sum, record) =>
        sum +
        (parseInt(record.Adults || '0', 10) + parseInt(record.Kids || '0', 10)),
      0
    );
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
