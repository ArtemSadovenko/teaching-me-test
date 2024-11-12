import React, { useState } from "react";
import CalendarIcon from "./CalendarIcon";
import CloseIcon from "./CloseIcon";

type CatigorisData = {
  id: string;
  name: string;
  code: number;
  description: string;
  teachersCount: number;
  childrenCategories: {
    id: string;
    name: string;
    code: number;
    description: string;
    teachersCount: number;
    childrenCategories: [];
  }[];
}[];

type CostPair = {
  category: string,
  avg: number
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<CostPair []>([])

  const fetchCategories = async () => {
    const response = await fetch(
      "https://test.teaching-me.org/categories/v1/open/categories",
      {
        method: "GET",
        headers: {
          "Accept-Language": "en",
        },
      }
    );

    const data: CatigorisData = (await response.json()) as CatigorisData;
    return data;
  };

  const fetchTeachersByCategory = async (
    categoryId: number,
    page: number,
    pageSize: number
  ) => {
    const response = await fetch(
      "https://test.teaching-me.org/categories/v1/open/search",
      {
        method: "POST",
        headers: {
          "Accept-Language": "en",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categories: [categoryId],
          page: page,
          pageSize: pageSize,
        }),
      }
    );

    const data = await response.json();
    return data;
  };

  const postAveragePrice = async (
    categoryName: string,
    averagePrice: number
  ) => {
    await fetch(
      "https://test.teaching-me.org/categories/v1/open/average-price",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryName: categoryName,
          averagePrice: averagePrice,
        }),
      }
    );
  };

  const calculateAveragePrice = async () => {
    setLoading(true);
    setError(null);
    

    try {
      const categoriesData: CatigorisData = await fetchCategories();
      const categories = categoriesData || [];

      for (let category of categories) {
        let page = 0;
        let totalTeachers = 0;
        let totalPrice = 0;

        while (true) {
          const teachersData = await fetchTeachersByCategory(
            category.code,
            page,
            10
          );
          const teachers = teachersData.teachers;

          if (teachers.length === 0) break;

          teachers.forEach((teacher: any) => {
            totalTeachers += 1;
            totalPrice += teacher.pricePerHour || 0;
          });

          page += 1;
          console.log(page);
        }

        const averagePrice = totalTeachers > 0 ? totalPrice / totalTeachers : 0;
        list.push({ category: category.name, avg: averagePrice } as CostPair)
        // setList([...list, { category: category.name, avg: averagePrice } as CostPair]);
        await postAveragePrice(category.name, averagePrice);
      }
    } catch (err) {
      setError("Error occurred while calculating average price");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            flexDirection:"column"
          }}
        >
          <button onClick={calculateAveragePrice} disabled={loading}>
            {loading ? "Calculating..." : "Calculate Average Price"}
          </button>
          {error && <p>{error}</p>}

          <ul>
            {list.map((item) => <li id={item.category} key={item.category}>{item.category}: {item.avg}</li>)}
          </ul>
        </div>

        <div
          style={{
            position: "fixed",
            bottom: "0",
            right: "0",
            margin: "10px",
            border: "solid 1px #ededed",
            borderRadius: "15px",
            width: "460px",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                backgroundColor: "#d6e0ff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "100%",
                margin: "20px 10px 10px 10px ",
              }}
            >
              <CalendarIcon size={48} />
            </div>

            <div>
              <h4>Request for the lesson</h4>
              <p
                style={{
                  color: "#c7c7c7",
                }}
              >
                Daniel Hamilton wants to start a lesson,
                <br /> plese confirm or deny the request
              </p>
              <h6
                style={{
                  color: "#c7c7c7",
                  margin: "0",
                }}
              >
                18 Dec, 14:50pm, 2022
              </h6>
            </div>
            <div
              style={{
                margin: "20px 10px 10px 10px ",
                cursor: "pointer",
              }}
            >
              <CloseIcon />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "24px 24px 24px 24px ",
            }}
          >
            <button
              style={{
                marginRight: "20px",
                backgroundColor: "white",
                border: "1px solid #c7c7c7",
                borderRadius: "10px",
                padding: "6px 12px 6px 12px ",
                cursor: "pointer",
              }}
            >
              View details
            </button>
            <button
              style={{
                backgroundColor: "black",
                color: "white",
                border: "1px solid #c7c7c7",
                borderRadius: "10px",
                padding: "6px 12px 6px 12px ",
                cursor: "pointer",
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
