export class GroupItem {
  id: string;
  title: string;
  data: any;

  constructor(id: string, title?: string, data?: any) {
    this.id = id;
    this.title = title || id.toString();
    this.data = data || id;
  }
}
