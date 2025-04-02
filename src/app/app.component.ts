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

  updateRecord(index: number, field: string, value: any): void {
    this.data[index][field] =
      field === 'CheckedIn' ? value.target.checked : value.target.value;
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalGuests = this.data.reduce(
      (sum, record) =>
        sum + (parseInt(record.Adults || 0) + parseInt(record.Kids || 0)),
      0
    );
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
