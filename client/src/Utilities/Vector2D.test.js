import Vector2D from "./Vector2D";
import Vector2DConsumer from "./Vector2DConsumer"

jest.mock('./Vector2D');

beforeEach(() => {

    Vector2D.mockClear();
  });

  describe("Vector2D", () => {
    const vec = new Vector2D(1, 1);
    const vecB = new Vector2D(1, 1);
    const addSpy = jest.spyOn(vec, "add");
    const getArray = jest.spyOn(vec, "getArray");
    it("add works correctly", () => {
        const result = vec.add(vecB)
        expect(vec.add(vecB).getArray()).toBe([1, 1]) 
        
    });
  });

  