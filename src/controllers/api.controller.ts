import {Request, Response} from "express";
import {fetchData} from "../utils/api.utils";


let url = 'https://jsonplaceholder.typicode.com/posts'

export const getApi =
    (comments: boolean = false) =>
        async (req: Request, res: Response) => {
            try {
                const id = req.params.id ? Number(req.params.id) : undefined

                if (id) {
                    url += `/${id}`;
                    if (comments) url += `/comments`;
                }

                res.status(200).json(await fetchData(url));
            } catch (error: any) {
                res.status(500).json({error: error.message || error.name || error});
            }
        };
