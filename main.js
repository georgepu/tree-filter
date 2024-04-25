import { rawData } from './data';
import './style.css';

const treeContainer = document.querySelector('#tree');
const newData = transformData(rawData);
let filterMode = false;

createTree(treeContainer, newData);

document.querySelector('#generateButton').addEventListener('click', () => {
  const filteredTreeData = filterTree(newData);
  filterMode = true;
  createTree(treeContainer, filteredTreeData);
});

//transform raw data structure
function transformData(data) {
  const root = [],
    dataMap = {};
  rawData.forEach((data) => {
    dataMap[data.id] = {
      ...data,
      children: [],
      isChecked: false,
    };
  });
  rawData.forEach((data) => {
    if (data.parent > 0) {
      dataMap[data.parent].children.push(dataMap[data.id]);
    } else {
      root.push(dataMap[data.id]);
    }
  });
  return root;
}

//display transformed tree structure
function createTree(parent, items) {
  const ul = document.createElement('ul');
  parent.appendChild(ul);

  items.forEach((item) => {
    const li = document.createElement('li');
    ul.appendChild(li);
    //add checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.isChecked;
    checkbox.addEventListener('change', () => {
      item.isChecked = !item.isChecked;
    });
    item.parent && li.appendChild(checkbox);
    //add label name text
    const span = document.createElement('span');
    span.textContent = item.name;
    li.appendChild(span);
    //add total count
    const totalSpan = document.createElement('span');
    totalSpan.classList.add('total-span');
    if (filterMode) {
      if (item.isChecked) {
        if (item.children.length) {
          totalSpan.textContent = `${getTotalCheckedCount(item) - 1}`;
        }
      } else if (item.children.length) {
        totalSpan.textContent = `${getTotalCheckedCount(item)}`;
      }
    } else {
      totalSpan.textContent = `${item.children.length}`;
    }
    item.children.length && li.appendChild(totalSpan);
    //add toggle symbols, up arrow indicates expanded, down arrow collapsed
    const toggle = document.createElement('span');
    toggle.classList.add('tree-toggle');
    //hide or display children on toggle clicks
    if (item.children.length > 0) {
      li.appendChild(toggle);
      item.isExpanded && toggle.classList.toggle('expanded');
      const childUl = createTree(li, item.children);
      childUl.style.display = item.isExpanded ? 'block' : 'none';
    }
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('expanded');
      item.isExpanded = !item.isExpanded;
      const childUl = li.querySelector('ul');
      if (childUl) {
        childUl.style.display = item.isExpanded ? 'block' : 'none';
      }
    });
  });
  return ul;
}

//upon clicking the generate btn
function filterTree(treeData) {
  const filteredData = treeData.filter((row) => {
    if (row.children && row.children.length) {
      row.children = filterTree(row.children);
    }
    return row.isChecked || row.children.length > 0;
  });
  return filteredData;
}

//filtered list needs to show total number of checked children nodes at parent level
function getTotalCheckedCount(item) {
  let totalCount = item.isChecked ? 1 : 0;
  item.children.forEach((child) => {
    totalCount += getTotalCheckedCount(child);
  });
  return totalCount;
}
